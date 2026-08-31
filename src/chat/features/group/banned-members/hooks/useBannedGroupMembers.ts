// useBannedGroupMembers — ported from AmityUiKitWeb
// v4/chat/features/group/banned-members/hooks/useBannedGroupMembers.
//
// State + actions for the banned-member list: debounced search, back, and the
// per-member unban action. Web debounced via react-use and confirmed through the
// ConfirmProvider; RN uses a setTimeout debounce and the native `Alert.alert`,
// calls `ChannelRepository.Moderation.unbanMembers` (gated on
// `useAuth().isConnected`), and surfaces the toast through the
// `useChatNotifications` stub. `onBack` defaults to `useChatNavigation().pop()`.

import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import { resolveString } from '../../../../../core/localization';
import useAuth from '../../../../../core/hooks/useAuth';
import { useChatNavigation } from '../../../../hooks/useChatNavigation';
import { useChatNotifications } from '../../../../hooks/useChatNotifications';

const SEARCH_DEBOUNCE_MS = 300;

export type UseBannedGroupMembersParams = {
  channelId: string;
  onBack?: () => void;
};

export function useBannedGroupMembers({
  channelId,
  onBack,
}: UseBannedGroupMembersParams) {
  const { pop } = useChatNavigation();
  const { isConnected } = useAuth();
  const { success } = useChatNotifications();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(searchText),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleBack = onBack ?? pop;

  function handleUnban(user: Amity.InternalUser) {
    Alert.alert(
      resolveString('amity_chat_unban_confirm_title'),
      resolveString('amity_chat_unban_confirm_message'),
      [
        { text: resolveString('amity_chat_cancel'), style: 'cancel' },
        {
          text: resolveString('amity_chat_unban_confirm_label'),
          onPress: async () => {
            if (!isConnected) return;
            await ChannelRepository.Moderation.unbanMembers(channelId, [
              user.userId,
            ]);
            success({ content: resolveString('amity_chat_action_unban_user') });
          },
        },
      ]
    );
  }

  return {
    channelId,
    searchText,
    setSearchText,
    debouncedSearch,
    handleBack,
    handleUnban,
  };
}
