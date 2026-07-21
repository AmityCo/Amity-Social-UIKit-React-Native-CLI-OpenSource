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
//     so this hook owns the pick+upload: `launchImageLibrary` → FormData →
//     `FileRepository.uploadImage` → `fileId` (the useMessageComposer pattern).
//     The form stores `avatarFileId` (string|null) rather than a File object.

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChannelRepository,
  FileRepository,
  Client,
} from '@amityco/ts-sdk-react-native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useString } from '../../../../../../../core/localization';
import { useToast } from '../../../../../../../core/stores/slices/toastSlice';
import { appendFileToFormData } from '../../../../../../../core/utils/fileUpload';
import type { RootStackParamList } from '../../../../../../../core/routes/RouteParamList';
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

// Build the RN multipart file part the SDK's uploadImage expects (iOS file://
// strip + { uri, name, type }), mirroring useMessageComposer's toFormData.
function toFormData(asset: Asset): FormData {
  const formData = new FormData();
  appendFileToFormData(
    formData,
    'files',
    asset.uri ?? '',
    asset.fileName ?? 'upload',
    asset.type ?? 'application/octet-stream'
  );
  return formData;
}

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

  const [avatarImageUrl, setAvatarImageUrl] = useState<string | undefined>(
    undefined
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

  const handlePickAvatar = useCallback(async () => {
    if (isUploadingAvatar) return;
    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    if (response.didCancel || response.errorCode) return;
    const asset = response.assets?.[0];
    if (!asset || !asset.uri) return;

    const previousUrl = avatarImageUrl;
    setAvatarImageUrl(asset.uri);
    setIsUploadingAvatar(true);
    try {
      const uploaded = await FileRepository.uploadImage(toFormData(asset));
      const fileId = uploaded?.data?.[0]?.fileId;
      if (!fileId) throw new Error('Upload did not return a fileId.');
      form.setValue('avatarFileId', fileId, { shouldValidate: true });
    } catch {
      // No dedicated avatar-upload-error string exists; revert the preview so
      // the tile falls back to the placeholder rather than showing a wrong toast.
      setAvatarImageUrl(previousUrl);
      form.setValue('avatarFileId', null, { shouldValidate: true });
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [avatarImageUrl, isUploadingAvatar, form]);

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
            showToast({ message: createSuccessToast, type: 'success' });
            replaceLater(GROUP_CHAT_ROUTE, { channelId });
          }
        },
        onError: () => {
          showToast({ message: createErrorToast, type: 'failed' });
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
