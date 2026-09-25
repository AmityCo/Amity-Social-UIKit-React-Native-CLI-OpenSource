// useCreateGroupChat — state + actions for the create-group step. Ported from
// AmityUiKitWeb v4/chat/features/group/create/hooks/useCreateGroupChat, keeping
// the react-hook-form + zod + react-query shape so CreateGroupChat consumes it
// via <Controller> unchanged.
//
// RN adaptations from web:
//   - Navigation: web's ChatNavigationProvider (`pop`/`replace`/`push`) →
//     React Navigation. `handleClose`→goBack, create success→`replace` into the
//     group chat, `handleAddMember`→`navigate` to the select-member step. The
//     destination routes (AmityGroupChatPage, AmitySelectGroupMemberPage)
//     register in a later wave, so those nav calls are cast past the typed
//     RootStackParamList (only AmityGroupChatPage is a confirmed name).
//   - Current user: web `useUser({ userId })` (reactive) → `Client.getCurrentUser()`
//     (the useCurrentUserId pattern); it already returns an `Amity.User`.
//   - Toasts: web `useNotifications('chat')` → the redux `useToast` slice.
//   - Confirm dialog: web `useConfirmContext().confirm` → RN `Alert.alert`.
//   - Avatar: web's `AvatarPicker` took an SDK `File` via `{ value, onChange }`;
//     the RN AvatarPicker is presentational (`imageUrl`/`onPick`/`isUploading`),
//     so this hook owns the pick+upload. It delegates to the repo's
//     `useImagePicker` (the same hook the sibling edit-profile screen uses),
//     which wraps launchCamera/launchImageLibrary and `useUpload`. The form
//     stores `avatarFileId` (string|null) rather than a File object.
//   - The AvatarPicker now reports which source the user chose in its
//     Camera/Photo sheet (web's drawer), so this hook branches openCamera vs
//     openImageGallery instead of always opening the gallery.
//   - Going through `useImagePicker`/`useUpload` is also what surfaces
//     the "Inappropriate image" dialog on a moderation rejection (error 400314 /
//     INVALID_IMAGE) - the old inline FileRepository.uploadImage call swallowed
//     that error in a bare catch. The preview is resolved from the *uploaded*
//     fileId rather than the local uri, so a rejected image is never shown as
//     the group avatar.

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChannelRepository, Client } from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import useFile from '../../../../../core/hooks/useFile';
import { useString } from '../../../../../core/localization';
import { useToast } from '../../../../../core/stores/slices/toastSlice';
import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import useImagePicker from '../../../../../social/hooks/useImagePicker';
import type { AvatarPickerSource } from '../../../../elements/AvatarPicker';
import { generateDisplayName } from '../utils/generateDisplayName';

// Web reads GROUP_NAME_MAX_LENGTH from chat/constants; inlined to match the
// GroupNameField element and keep the port self-contained.
const GROUP_NAME_MAX_LENGTH = 100;

// Route names. Web pushed ChatPageTypes descriptors; RN targets React Navigation
// routes. Only AmityGroupChatPage is a confirmed name — the select route is an
// assumption a later wave must confirm.
const GROUP_CHAT_ROUTE = 'AmityGroupChatPage';
const SELECT_GROUP_MEMBER_ROUTE = 'AmitySelectGroupMemberPage';

// Web imported this from ~/v4/chat/pages/CreateGroupChatPage (absent in RN).
export type CreateGroupChatPageProps = {
  selectedUsers: Amity.User[];
};

type CreateChannelParams = Parameters<
  typeof ChannelRepository.createChannel
>[0];
type CreateChannelResponse = Awaited<
  ReturnType<typeof ChannelRepository.createChannel>
>;

const schema = z.object({
  avatarFileId: z.string().nullable(),
  name: z.string().trim().max(GROUP_NAME_MAX_LENGTH),
  isPublic: z.boolean(),
  members: z.array(z.custom<Amity.User>()).min(1),
});

export type CreateGroupChatForm = z.infer<typeof schema>;

export function useCreateGroupChat({
  selectedUsers,
}: CreateGroupChatPageProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showToast } = useToast();
  const currentUser = Client.getCurrentUser();

  const leaveConfirmText = useString('amity_chat_group_leave_confirm_label');
  const cancelText = useString('amity_chat_cancel');
  const createSuccessToast = useString('amity_chat_create_group_success');
  const createErrorToast = useString('amity_chat_create_group_error');
  const leaveWithoutFinishingTitle = useString(
    'amity_chat_leave_without_finishing_title'
  );
  const leaveWithoutFinishingContent = useString(
    'amity_chat_leave_without_finishing_message'
  );

  const {
    openCamera,
    openImageGallery,
    isLoading: isUploadingAvatar,
  } = useImagePicker();

  const form = useForm<CreateGroupChatForm>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      avatarFileId: null,
      name: '',
      isPublic: true,
      members: selectedUsers,
    },
  });

  const { mutateAsync } = useMutation<
    CreateChannelResponse,
    Error,
    CreateChannelParams
  >({
    mutationFn: ChannelRepository.createChannel,
  });

  const navigateLater = navigation.navigate as unknown as (
    name: string,
    params?: object
  ) => void;
  const replaceLater = navigation.replace as unknown as (
    name: string,
    params?: object
  ) => void;

  // Preview the *uploaded* avatar, not the local uri: an image the backend
  // rejects must never end up shown as the group avatar.
  const avatarFileId = form.watch('avatarFileId');
  const avatarImageUrl = useFile({ fileId: avatarFileId ?? '' });

  // `source` comes from the AvatarPicker's Camera/Photo sheet.
  // useImagePicker handles the camera permission prompt, the unsupported-type
  // alert and — via useUpload — the "Inappropriate image" dialog;
  // it resolves to the uploaded Amity.File, or a falsy value when the user
  // cancelled or the upload was rejected.
  const handlePickAvatar = useCallback(
    async (source: AvatarPickerSource) => {
      if (isUploadingAvatar) return;
      // useImagePicker declares `void | Amity.File<'image'>`; at runtime it
      // resolves to the uploaded file, or a nullish value when the user
      // cancelled, the type was unsupported, or the upload was rejected.
      const uploaded = (
        source === 'camera'
          ? await openCamera({ mediaType: 'photo', quality: 1 })
          : await openImageGallery({
              mediaType: 'photo',
              quality: 1,
              selectionLimit: 1,
            })
      ) as Amity.File<'image'> | undefined;
      if (uploaded?.fileId) {
        form.setValue('avatarFileId', uploaded.fileId, {
          shouldValidate: true,
        });
      }
    },
    [isUploadingAvatar, openCamera, openImageGallery, form]
  );

  function handleClose() {
    Alert.alert(leaveWithoutFinishingTitle, leaveWithoutFinishingContent, [
      { text: cancelText, style: 'cancel' },
      {
        text: leaveConfirmText,
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  }

  function handleAddMember() {
    navigateLater(SELECT_GROUP_MEMBER_ROUTE, {
      selectedGroupMember: form.getValues('members'),
    });
  }

  const handleCreate = form.handleSubmit(async (values) => {
    const trimmed = values.name.trim();
    const displayName =
      trimmed ||
      generateDisplayName([
        ...(currentUser ? [currentUser] : []),
        ...values.members,
      ]);

    await mutateAsync(
      {
        type: 'community',
        displayName,
        isPublic: values.isPublic,
        userIds: values.members.map((u) => u.userId),
        avatarFileId: values.avatarFileId ?? undefined,
      },
      {
        onSuccess: (result) => {
          const channelId = result?.data?.channelId;
          if (channelId) {
            showToast({
              message: createSuccessToast,
              type: 'success',
              variant: 'custom',
            });
            replaceLater(GROUP_CHAT_ROUTE, { channelId });
          }
        },
        onError: () => {
          showToast({
            message: createErrorToast,
            type: 'failed',
            variant: 'custom',
          });
        },
      }
    );
  });

  return {
    form,
    currentUser,
    avatarImageUrl,
    isUploadingAvatar,
    handlePickAvatar,
    handleClose,
    handleAddMember,
    handleCreate,
    isFormValid: form.formState.isValid || form.formState.isSubmitting,
  };
}
