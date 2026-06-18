import * as z from 'zod';
import { useEffect, useRef } from 'react';
import { useStyles } from '../styles';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Client, UserRepository } from '@amityco/ts-sdk-react-native';
import { useToast } from '../../../../../core/stores/slices/toastSlice';
import { CHARACTER_LIMIT, ERROR_CODE } from '../../../../../core/constants';
import { PageID } from '../../../../enums';
import { useAmityPage } from '../../../../hooks';
import { useNetInfo } from '@react-native-community/netinfo';
import { useUpload } from '../../../../../core/hooks';

// A visitor session is read-only, so the avatar cannot be uploaded while the
// page is shown (still a visitor). Instead we hold the locally picked image
// (just its uri) and upload it AFTER Client.login signs the user in.
export type LocalImage = { uri: string };

// The success toast is hosted inside this page's tree. onCreated typically
// tears that tree down (host swaps to the signed-in app), which would unmount
// the toast before it finishes fading in. Defer onCreated so the success toast
// stays visible across the transition. Sized to the toast fade-in + a brief
// display window.
const ON_CREATED_DELAY = 800;

const schema = z.object({
  image: z.custom<LocalImage>().nullish(),
  displayName: z.string().min(1).max(CHARACTER_LIMIT.USER_DISPLAY_NAME),
  description: z.string().max(CHARACTER_LIMIT.USER_DESCRIPTION).optional(),
});

export type CreateProfileFormValues = z.infer<typeof schema>;

type CreatedUser = { userId: string; displayName: string };

type UseCreateProfileParams = {
  userId: string;
  authToken?: string;
  /**
   * Optional remote avatar URL supplied by the host. Used as the avatar when
   * the user does not pick a local photo. A locally picked image always wins.
   * Uploaded after login via the from-URL REST endpoint.
   */
  defaultAvatarImageUrl?: string;
  onCreated?: (user: CreatedUser) => void;
};

type UploadedFile = { fileId?: string };

// `/api/v4/images/from-url` returns the uploaded file under a single `items`
// OBJECT (not an array): `{ items: { fileId, ... } }`. Parse defensively across
// the shapes the API may use so the fileId is never silently dropped.
const extractFileId = (body: any): string | undefined => {
  const pickFromArray = (arr?: UploadedFile[]) =>
    arr?.find((f) => f?.fileId)?.fileId;
  if (Array.isArray(body)) return pickFromArray(body);
  const items = body?.items;
  return (
    (Array.isArray(items) ? pickFromArray(items) : items?.fileId) ??
    pickFromArray(body?.data) ??
    body?.fileId
  );
};

// The provider owns visitor login; this page performs the real signed-in login
// itself on save (mirroring the Web UIKit's CreateUserProfilePage). Logging in
// with a userId creates the user on the network if it does not exist yet and
// sets the initial display name — the visitor -> signed-in transition. The host
// then settles the session by passing the returned userId to the provider.
export const useCreateProfile = ({
  userId,
  authToken,
  defaultAvatarImageUrl,
  onCreated,
}: UseCreateProfileParams) => {
  const { styles, theme } = useStyles();
  const { accessibilityId } = useAmityPage({
    pageId: PageID.create_user_profile_page,
  });

  const { showToast, hideToast } = useToast();
  const { isConnected } = useNetInfo();
  const { uploadImage } = useUpload();

  // Tracks the deferred onCreated call so it can be cleared if the page
  // unmounts before it fires.
  const onCreatedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  useEffect(() => () => clearTimeout(onCreatedTimer.current), []);

  const {
    watch,
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<CreateProfileFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      image: null,
      displayName: '',
      description: '',
    },
  });

  const sessionHandler: Amity.SessionHandler = {
    sessionWillRenewAccessToken(renewal) {
      renewal.renew();
    },
  };

  const { mutateAsync } = useMutation<
    CreatedUser,
    Error,
    CreateProfileFormValues
  >({
    mutationKey: ['create-user-profile', userId],
    onMutate: () => {
      // Long-running toast shown while the SDK calls run, matching the loading
      // toast used by other composers (e.g. PollPostComposer).
      showToast({ message: 'Creating profile...', type: 'loading' });
    },
    mutationFn: async (data) => {
      let loginParam: Amity.ConnectClientParams = {
        userId,
        displayName: data.displayName || undefined,
      };
      if (authToken && authToken.length > 0) {
        loginParam = { ...loginParam, authToken };
      }

      await Client.login(loginParam, sessionHandler);

      // The avatar upload is a write, which a visitor session cannot perform.
      // Now that login has signed the user in, resolve the avatar from one of
      // two sources (a locally picked image always wins over the host-provided
      // default URL), then apply the remaining profile fields (about + avatar).
      let avatarFileId: string | undefined;
      if (data.image?.uri) {
        // Local file → binary multipart upload (streams to the upload host).
        const uploaded = await uploadImage({ file: data.image.uri });
        avatarFileId = uploaded?.data?.[0]?.fileId;
      } else if (defaultAvatarImageUrl) {
        // Remote URL → from-URL REST endpoint. This is served by the API host
        // (client.http → apix.{region}.amity.co), NOT the binary upload host;
        // calling it on client.upload returns 404. The access token is attached
        // automatically now that login has resolved.
        const client = Client.getActiveClient();
        const { data: body } = await client.http.post(
          '/api/v4/images/from-url',
          { fileUrl: defaultAvatarImageUrl }
        );
        avatarFileId = extractFileId(body);
        if (!avatarFileId) {
          throw new Error(
            `Upload image from URL succeeded but no fileId was returned: ${JSON.stringify(
              body
            )}`
          );
        }
      }

      // displayName is set during login; apply the remaining fields here.
      const payload: Parameters<typeof UserRepository.updateUser>[1] = {
        description: data.description || undefined,
        avatarFileId,
      };

      if (payload.description != null || payload.avatarFileId != null) {
        await UserRepository.updateUser(userId, payload);
      }

      return { userId, displayName: data.displayName || '' };
    },
    onSuccess: (createdUser) => {
      // Replace the loading toast in-place (no hideToast first — a hide->show
      // double dispatch can cancel the success toast's fade-in before it shows).
      showToast({
        type: 'success',
        message: 'Successfully created your profile!',
      });
      // Defer the transition briefly so the toast starts showing here before the
      // host swaps screens. The toast state is shared (Redux), so it keeps
      // displaying on the destination (signed-in) screen too.
      onCreatedTimer.current = setTimeout(
        () => onCreated?.(createdUser),
        ON_CREATED_DELAY
      );
    },
    onError: (error) => {
      hideToast();
      if (error.message?.includes(ERROR_CODE.BLOCKED_WORD)) {
        showToast({
          type: 'informative',
          message: "Your profile wasn't saved as it contains a blocked word.",
        });
        return;
      }
      showToast({
        type: 'informative',
        message: 'Failed to save your profile. Please try again.',
      });
    },
  });

  const onSubmit = async (data: CreateProfileFormValues) => {
    if (isConnected === false) {
      showToast({
        type: 'informative',
        message: 'Failed to save your profile. Please try again.',
      });
      return;
    }
    await mutateAsync(data);
  };

  return {
    styles,
    theme,
    watch,
    control,
    handleSubmit,
    onSubmit,
    isValid,
    isSubmitting,
    accessibilityId,
  };
};
