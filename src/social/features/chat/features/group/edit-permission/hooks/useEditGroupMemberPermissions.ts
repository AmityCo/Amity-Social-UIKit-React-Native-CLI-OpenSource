// useEditGroupMemberPermissions — RN port of AmityUiKitWeb
// v4/chat/features/group/edit-permission/hooks/useEditGroupMemberPermissions.
// Owns the messaging-permission form: the current selection, dirty tracking and
// the mute/unmute mutation.
//
// RN adaptations from web:
//   - Web `react-hook-form` + `zod` (`useForm({ values })`) → plain `useState`
//     seeded from the live channel's `isMuted` once it loads (an effect keyed on
//     the channel id). `isDirty`/`isSubmitting` are computed by hand.
//   - Web `useChannelObject` → an inline `ChannelRepository.getChannel` live
//     subscription (gated on `useAuth().isConnected`, like `useConversation`).
//   - Web `useUpdateChannelMutePermissionQuery` mapped ModeratorsOnly →
//     `ChannelRepository.muteChannel(id, -1)` and Everyone →
//     `ChannelRepository.unmuteChannel(id)`. Both methods exist on the RN SDK, so
//     the same mapping is used directly here (no stub needed).
//   - Web `useNotifications('chat')` → the redux toast (`useToast`).

// 1. React / RN imports
import { useEffect, useState } from 'react';

// 2. Third-party imports
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import useAuth from '../../../../../../../core/hooks/useAuth';
import { useString } from '../../../../../../../core/localization';
import { useToast } from '../../../../../../../core/stores/slices/toastSlice';
import { AmityChannelMessagingPermissionEnum } from '../constants';

// Web's INDEFINITE_MUTE_PERIOD — mute forever.
const INDEFINITE_MUTE_PERIOD = -1;

// 4. Types
export type EditGroupMemberPermissionsProps = {
  channelId: string;
};

// 5. Hook
export function useEditGroupMemberPermissions({
  channelId,
}: EditGroupMemberPermissionsProps) {
  const { isConnected } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const successToast = useString('amity_chat_edit_group_perm_toast_success');
  const failedToast = useString('amity_chat_edit_group_perm_toast_failed');

  const [channel, setChannel] = useState<Amity.Channel | undefined>(undefined);
  const [permission, setPermission] =
    useState<AmityChannelMessagingPermissionEnum>(
      AmityChannelMessagingPermissionEnum.Everyone
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

  const initialPermission = channel?.isMuted
    ? AmityChannelMessagingPermissionEnum.ModeratorsOnly
    : AmityChannelMessagingPermissionEnum.Everyone;

  // Seed the selection once the channel loads (web's `useForm({ values })`).
  useEffect(() => {
    if (!channel) return;
    setPermission(
      channel.isMuted
        ? AmityChannelMessagingPermissionEnum.ModeratorsOnly
        : AmityChannelMessagingPermissionEnum.Everyone
    );
  }, [channel?.channelId]);

  const isDirty = permission !== initialPermission;
  const isFormValid = !isSubmitting && isDirty;

  function handleClose() {
    navigation.goBack();
  }

  async function handleSave() {
    if (!isFormValid || !isConnected || !channelId) return;
    setIsSubmitting(true);
    try {
      if (permission === AmityChannelMessagingPermissionEnum.ModeratorsOnly) {
        await ChannelRepository.muteChannel(channelId, INDEFINITE_MUTE_PERIOD);
      } else {
        await ChannelRepository.unmuteChannel(channelId);
      }
      showToast({ message: successToast, type: 'success', variant: 'custom' });
      navigation.goBack();
    } catch {
      showToast({ message: failedToast, type: 'failed', variant: 'custom' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    permission,
    setPermission,
    isFormValid,
    handleClose,
    handleSave,
  };
}
