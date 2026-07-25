// useEditGroupProfile — RN port of AmityUiKitWeb
// v4/chat/features/group/edit-profile/hooks/useEditGroupProfile. Owns the
// edit-group-profile form: the display name, the group avatar, dirty/valid
// tracking, and the save mutation.
//
// RN adaptations from web:
//   - Web `react-hook-form` + `zod` (`useForm({ values })`) → plain `useState`
//     seeded from the live channel once it loads (an effect keyed on the channel
//     id), matching the sibling RN chat hooks. `values` re-sync becomes that
//     seeding effect; `isDirty`/`isValid`/`isSubmitting` are computed by hand.
//   - Web `useChannelObject` → an inline `ChannelRepository.getChannel` live
//     subscription (gated on `useAuth().isConnected`, like `useConversation`).
//   - Web's `AvatarPicker` owned the file pick + upload; the RN AvatarPicker is
//     presentational (`imageUrl` + `onPick`), so the pick + upload run here via
//     the repo's `useImagePicker` (same hook the user-profile edit uses). It
//     returns an uploaded `Amity.File`; we keep its `fileId`. Avatar *removal*
//     (web's nullable avatar) is not supported by the RN picker.
//   - Web `useUpdateChannelQuery` → `ChannelRepository.updateChannel` directly.
//   - Web `useNotifications('chat')` → the redux toast (`useToast`).

// 1. React / RN imports
import { useEffect, useMemo, useState } from 'react';

// 2. Third-party imports
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import useAuth from '../../../../../../../core/hooks/useAuth';
import useFile from '../../../../../../../core/hooks/useFile';
import { useString } from '../../../../../../../core/localization';
import { useToast } from '../../../../../../../core/stores/slices/toastSlice';
import useImagePicker from '../../../../../../hooks/useImagePicker';

// Web imports GROUP_NAME_MAX_LENGTH from chat/constants (= 100); inlined to match
// the GroupNameField element port.
const GROUP_NAME_MAX_LENGTH = 100;

// 4. Types
export type EditGroupProfileProps = {
  channelId: string;
};

// 5. Hook
export function useEditGroupProfile({ channelId }: EditGroupProfileProps) {
  const { isConnected } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { openImageGallery, imageUri, isLoading, uploadedImage } =
    useImagePicker();

  const updateSuccessToast = useString('amity_chat_group_edit_profile');
  const updateFailedToast = useString('amity_chat_group_edit_profile_failed');

  const [channel, setChannel] = useState<Amity.Channel | undefined>(undefined);
  const [name, setName] = useState('');
  const [avatarFileId, setAvatarFileId] = useState<string | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live channel object (web `useChannelObject`).
  useEffect(() => {
    if (!isConnected || !channelId) return undefined;
    const unsub = ChannelRepository.getChannel(channelId, ({ data }) => {
      if (data) setChannel(data);
    });
    return () => {
      unsub();
    };
  }, [isConnected, channelId]);

  // Seed the form once the channel loads (web's `useForm({ values })` re-sync).
  // Keyed on the channel id so later live updates don't clobber in-progress edits.
  const initialName = channel?.displayName ?? '';
  const initialAvatarFileId = channel?.avatarFileId;
  useEffect(() => {
    if (!channel) return;
    setName(channel.displayName ?? '');
    setAvatarFileId(channel.avatarFileId);
  }, [channel?.channelId]);

  // Adopt a freshly uploaded avatar's fileId.
  useEffect(() => {
    if (uploadedImage?.fileId) {
      setAvatarFileId(uploadedImage.fileId);
    }
  }, [uploadedImage]);

  // Preview: the just-picked local uri wins; otherwise resolve the stored fileId.
  const resolvedAvatarUrl = useFile({ fileId: avatarFileId ?? '' });
  const imageUrl = imageUri ?? resolvedAvatarUrl;

  const trimmedName = name.trim();
  const isValid =
    trimmedName.length >= 1 && trimmedName.length <= GROUP_NAME_MAX_LENGTH;
  const isDirty = useMemo(
    () =>
      name !== initialName ||
      (avatarFileId ?? undefined) !== (initialAvatarFileId ?? undefined),
    [name, avatarFileId, initialName, initialAvatarFileId]
  );

  const isFormValid = !isSubmitting && !isLoading && isDirty && isValid;

  function handleClose() {
    navigation.goBack();
  }

  function handlePickAvatar() {
    openImageGallery({ mediaType: 'photo', quality: 1, selectionLimit: 1 });
  }

  async function handleSave() {
    if (!isFormValid || !isConnected || !channelId) return;
    setIsSubmitting(true);
    try {
      await ChannelRepository.updateChannel(channelId, {
        displayName: trimmedName,
        avatarFileId,
      });
      showToast({
        message: updateSuccessToast,
        type: 'success',
        variant: 'custom',
      });
      navigation.goBack();
    } catch {
      showToast({
        message: updateFailedToast,
        type: 'failed',
        variant: 'custom',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    name,
    onChangeName: setName,
    imageUrl,
    isUploading: isLoading,
    isFormValid,
    handlePickAvatar,
    handleClose,
    handleSave,
  };
}
