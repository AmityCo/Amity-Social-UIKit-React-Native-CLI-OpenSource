// useConversation — RN engine for the chat thread, distilled from AmityUiKitWeb
// useChat/useChatMessage. For a conversation channel the message sub-channel id
// equals the channel id (web uses `subChannelId: channelId ?? ''`), so we load
// messages with useMessagesCollection({ subChannelId: channelId }) and send with
// useCreateMessage. Reactions / reply / media / mentions layer on in later tasks.

import { useCallback } from 'react';
import { Client } from '@amityco/ts-sdk-react-native';

import { useCreateMessage, useMessagesCollection } from '../../../hooks';

const MESSAGE_PAGE_SIZE = 20;

export function useConversation(channelId?: string) {
  // Current user id — same source AmityChatListItem uses to tell "me" apart.
  const currentUserId = Client.getCurrentUser()?.userId;

  const subChannelId = channelId ?? '';

  const { messages, loading, hasNextPage, loadMore } = useMessagesCollection(
    { subChannelId, limit: MESSAGE_PAGE_SIZE },
    !!channelId
  );

  const { createMessage } = useCreateMessage();

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !subChannelId) return;
      await createMessage({ subChannelId, data: { text: trimmed } });
    },
    [createMessage, subChannelId]
  );

  return {
    messages,
    loading,
    hasNextPage,
    loadMore,
    sendText,
    currentUserId,
  };
}
