import * as z from 'zod';
import { useEffect, useRef, useState } from 'react';
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
import useAuth from '../../../../../core/hooks/useAuth';

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

export type CreatedUser = {
  userId: string;
  displayName: string;
  /** The about/description text the user entered, if any. */
  about?: string;
  /** The uploaded avatar's file URL, if an avatar was set. */
  imageUrl?: string;
};

/** The profile data passed to `enrollProfile`. Only `displayName` is forwarded
 * — the enrollment API doesn't require anything else from the client, and the
 * backend owns fields like `deviceId` (which can be any id, e.g. a randomly
 * generated UUID). The host may ignore the argument entirely if its enrollment
 * endpoint needs no input. */
export type EnrollProfileInput = { displayName?: string };

type UseCreateProfileParams = {
  /**
   * Static userId to create / sign in as. Provide this OR `enrollProfile`.
   */
  userId?: string;
  /**
   * Called on Save (before login) to enroll the user via the host's backend and
   * obtain the userId. Use when the host creates the user server-to-server (e.g.
   * `POST /community/enrollment`, which calls Amity `/api/v4/sessions` and
   * returns a `communityId`). Receives the entered `displayName`; resolve the
   * `communityId` (used as the userId for the signed-in login and profile
   * update). Throw to fail the flow — the host maps backend error codes (e.g.
   * banned / already-enrolled / retryable) and the UIKit shows a failure toast.
   * Provide this OR `userId`.
   */
  enrollProfile?: (input?: EnrollProfileInput) => Promise<string> | string;
  authToken?: string;
  /**
   * Secure-mode auth-token provider. Usually set once on AmityUiKitProvider and
   * inherited from there automatically — only pass it here to override that.
   * Called after the userId is resolved (static or via `enrollProfile`) with
   * that userId; return a short-lived auth token minted by your backend with
   * your Server Key. The token is passed to `Client.login`. Omit for unsecure
   * mode. Takes precedence over the static `authToken` when both are provided.
   */
  getAuthToken?: (userId: string) => Promise<string> | string;
  /**
   * Optional remote avatar URL supplied by the host. Used as the avatar when
   * the user does not pick a local photo. A locally picked image always wins.
   * Uploaded after login via the from-URL REST endpoint.
   */
  defaultAvatarImageUrl?: string;
  onCreated?: (user: CreatedUser) => void;
  /**
   * Fired when profile creation fails at any step of the save transaction —
   * generating the userId, `Client.login`, the avatar upload, or `updateUser`.
   * Receives the thrown error so the host can react (log it, show its own UI,
   * retry, etc.). The UIKit still shows its own failure toast in addition to
   * calling this. Mirrors `onCreated` for the failure path.
   */
  onError?: (error: Error) => void;
};

type UploadedFile = { fileId?: string; fileUrl?: string };

// `/api/v4/images/from-url` returns the uploaded file under a single `items`
// OBJECT (not an array): `{ items: { fileId, ... } }`. Parse defensively across
// the shapes the API may use so the uploaded file is never silently dropped.
const extractUploadedFile = (body: any): UploadedFile | undefined => {
  const pickFromArray = (arr?: UploadedFile[]) => arr?.find((f) => f?.fileId);
  if (Array.isArray(body)) return pickFromArray(body);
  const items = body?.items;
  return (
    (Array.isArray(items)
      ? pickFromArray(items)
      : items?.fileId
      ? items
      : undefined) ??
    pickFromArray(body?.data) ??
    (body?.fileId ? body : undefined)
  );
};

// The provider owns visitor login; this page performs the real signed-in login
// itself on save (mirroring the Web UIKit's CreateUserProfilePage). Logging in
// with a userId creates the user on the network if it does not exist yet and
// sets the initial display name — the visitor -> signed-in transition. The host
// then settles the session by passing the returned userId to the provider.
export const useCreateProfile = ({
  userId,
  enrollProfile,
  authToken,
  getAuthToken: getAuthTokenProp,
  defaultAvatarImageUrl,
  onCreated,
  onError,
}: UseCreateProfileParams) => {
  // Secure-mode token provider. Prefer the page prop, but fall back to the one
  // set once on AmityUiKitProvider (exposed via AuthContext) so the host does
  // not have to pass getAuthToken again here.
  const { getAuthToken: getAuthTokenFromContext } = useAuth();
  const getAuthToken = getAuthTokenProp ?? getAuthTokenFromContext;
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

  // True from the moment the mutation succeeds until the deferred redirect
  // fires. react-hook-form's `isSubmitting` flips back to false as soon as the
  // mutation resolves, which would re-enable the Save button during the
  // ON_CREATED_DELAY window before the host swaps screens. Keep the flow locked
  // through that gap so the user can't re-trigger submit.
  const [isCreated, setIsCreated] = useState(false);

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
      // Resolve the userId. The host either passes a static `userId`, or an
      // `enrollProfile` function (its backend enrollment call that creates the
      // user and returns the id) which runs here — on Save, before login — so a
      // failure surfaces through the same loading/error toast as the rest of the
      // flow.
      const resolvedUserId =
        userId ??
        (await enrollProfile?.({
          displayName: data.displayName,
        }));
      if (!resolvedUserId) {
        throw new Error(
          'CreateProfile: no userId. Pass `userId` or an `enrollProfile` that returns one.'
        );
      }

      let loginParam: Amity.ConnectClientParams = {
        userId: resolvedUserId,
        displayName: data.displayName || undefined,
      };
      // Secure mode: mint the auth token for the just-resolved userId. This is
      // why a callback (not a static token) is needed here — with enrollProfile
      // the userId doesn't exist until now, so the token can only be requested
      // after it's known. getAuthToken takes precedence over the static token.
      const resolvedAuthToken = getAuthToken
        ? await getAuthToken(resolvedUserId)
        : authToken;
      if (resolvedAuthToken && resolvedAuthToken.length > 0) {
        loginParam = { ...loginParam, authToken: resolvedAuthToken };
      }

      await Client.login(loginParam, sessionHandler);

      // The avatar upload is a write, which a visitor session cannot perform.
      // Now that login has signed the user in, resolve the avatar from one of
      // two sources (a locally picked image always wins over the host-provided
      // default URL), then apply the remaining profile fields (about + avatar).
      let avatarFileId: string | undefined;
      let avatarFileUrl: string | undefined;
      if (data.image?.uri) {
        // Local file → binary multipart upload (streams to the upload host).
        const uploaded = await uploadImage({ file: data.image.uri });
        avatarFileId = uploaded?.data?.[0]?.fileId;
        avatarFileUrl = uploaded?.data?.[0]?.fileUrl;
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
        const uploadedFile = extractUploadedFile(body);
        avatarFileId = uploadedFile?.fileId;
        avatarFileUrl = uploadedFile?.fileUrl;
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
        await UserRepository.updateUser(resolvedUserId, payload);
      }

      return {
        userId: resolvedUserId,
        displayName: data.displayName || '',
        about: data.description || undefined,
        imageUrl: avatarFileUrl,
      };
    },
    onSuccess: (createdUser) => {
      // Lock the flow until the deferred redirect fires so Save can't be
      // pressed again during the ON_CREATED_DELAY gap.
      setIsCreated(true);
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
      // Hand the failure back to the host so it can react (log, retry, show its
      // own UI). Fires for every failure path, alongside the UIKit's own toast.
      onError?.(error instanceof Error ? error : new Error(String(error)));

      hideToast();
      if (error.message?.includes(ERROR_CODE.BLOCKED_WORD)) {
        showToast({
          type: 'informative',
          message: "Your profile wasn't saved as it contains a blocked word.",
        });
        return;
      }
      if (error.message?.includes(ERROR_CODE.RATE_LIMIT)) {
        showToast({
          type: 'informative',
          message: 'Too many requests. Please wait a moment and try again.',
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
    // Already created and waiting to redirect — ignore any further submits.
    if (isCreated) return;
    if (isConnected === false) {
      showToast({
        type: 'informative',
        message: 'Failed to save your profile. Please try again.',
      });
      return;
    }
    // Swallow the rejection here: the failure is already surfaced to the user
    // via the mutation's onError toast (rate limit / upload / network errors).
    // Without this catch the rejected promise escapes as an uncaught promise
    // rejection and crashes to a red-box in dev builds.
    try {
      await mutateAsync(data);
    } catch {
      // handled in onError
    }
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
    isCreated,
    accessibilityId,
  };
};
