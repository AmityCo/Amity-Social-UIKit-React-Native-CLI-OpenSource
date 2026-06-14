import * as z from 'zod';
import { Alert } from 'react-native';
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
  onCreated?: (user: CreatedUser) => void;
};

// The provider owns visitor login; this page performs the real signed-in login
// itself on save (mirroring the Web UIKit's CreateUserProfilePage). Logging in
// with a userId creates the user on the network if it does not exist yet and
// sets the initial display name — the visitor -> signed-in transition. The host
// then settles the session by passing the returned userId to the provider.
export const useCreateProfile = ({
  userId,
  authToken,
  onCreated,
}: UseCreateProfileParams) => {
  const { styles, theme } = useStyles();
  const { accessibilityId } = useAmityPage({
    pageId: PageID.create_user_profile_page,
  });

  const { showToast } = useToast();
  const { isConnected } = useNetInfo();
  const { uploadImage } = useUpload();

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
    mutationFn: async (data) => {
      let loginParam: Amity.ConnectClientParams = {
        userId,
        displayName: data.displayName || undefined,
      };
      if (authToken && authToken.length > 0) {
        loginParam = { ...loginParam, authToken };
      }

      Alert.alert('DEBUG', 'step 1: login start');
      await Client.login(loginParam, sessionHandler);
      Alert.alert('DEBUG', 'step 2: login done');

      // The avatar upload is a write, which a visitor session cannot perform.
      // Now that login has signed the user in, upload the locally picked image
      // and then apply the remaining profile fields (about + avatar).
      let avatarFileId: string | undefined;
      if (data.image?.uri) {
        Alert.alert('DEBUG', 'step 3: upload start');
        const uploaded = await uploadImage({ file: data.image.uri });
        avatarFileId = uploaded?.data?.[0]?.fileId;
        Alert.alert('DEBUG', 'step 4: upload done ' + String(avatarFileId));
      }

      // displayName is set during login; apply the remaining fields here.
      const payload: Parameters<typeof UserRepository.updateUser>[1] = {
        description: data.description || undefined,
        avatarFileId,
      };

      if (payload.description != null || payload.avatarFileId != null) {
        Alert.alert('DEBUG', 'step 5: updateUser start');
        await UserRepository.updateUser(userId, payload);
        Alert.alert('DEBUG', 'step 6: updateUser done');
      }

      return { userId, displayName: data.displayName || '' };
    },
    onSuccess: (createdUser) => {
      showToast({
        type: 'success',
        message: 'Successfully updated your profile!',
      });
      onCreated?.(createdUser);
    },
    onError: (error) => {
      console.log('[CreateProfile] save failed:', error?.message, error);
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
