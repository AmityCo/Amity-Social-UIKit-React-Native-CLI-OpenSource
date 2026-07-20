// useConversation — RN engine for the chat thread, distilled from AmityUiKitWeb
// useChat/useChatMessage. For a conversation channel the message sub-channel id
// equals the channel id (web uses `subChannelId: channelId ?? ''`), so we load
// messages with useMessagesCollection({ subChannelId: channelId }) and send with
// useCreateMessage. Reactions / reply / media / mentions layer on in later tasks.

import { useCallback, useEffect, useState } from 'react';
import { ChannelRepository, Client } from '@amityco/ts-sdk-react-native';

import useAuth from '../../../../../../core/hooks/useAuth';
import {
  useCreateMessage,
  useDeleteMessage,
  useEditMessage,
  useMessagesCollection,
} from '../../../hooks';

const MESSAGE_PAGE_SIZE = 20;

type SendExtras = {
  mentionees?: (Amity.UserMention | Amity.ChannelMention)[];
  parentId?: string;
};

export function useConversation(channelId?: string) {
  // Current user id — same source AmityChatListItem uses to tell "me" apart.
  const currentUserId = Client.getCurrentUser()?.userId;
  const { isConnected } = useAuth();

  const subChannelId = channelId ?? '';

  // Live channel object — drives group-vs-direct behaviour (sender names show only
  // in group chats) and the header title/avatar.
  const [channel, setChannel] = useState<Amity.Channel | undefined>(undefined);
  useEffect(() => {
    if (!isConnected || !channelId) return undefined;
    const unsub = ChannelRepository.getChannel(channelId, ({ data }) => {
      if (data) setChannel(data);
    });
    return () => {
      unsub();
    };
  }, [isConnected, channelId]);

  const isGroupChat = channel?.type === 'community';

  const { messages, loading, hasNextPage, loadMore } = useMessagesCollection(
    { subChannelId, limit: MESSAGE_PAGE_SIZE },
    !!channelId
  );

  const { createMessage } = useCreateMessage();
  const { editMessage } = useEditMessage();
  const { deleteMessage } = useDeleteMessage();

  const sendText = useCallback(
    async (text: string, extras?: SendExtras) => {
      const trimmed = text.trim();
      if (!trimmed || !subChannelId) return;
      const mentionees = extras?.mentionees;
      await createMessage({
        subChannelId,
        data: { text: trimmed },
        ...(mentionees && mentionees.length ? { mentionees } : {}),
        ...(extras?.parentId ? { parentId: extras.parentId } : {}),
      });
    },
    [createMessage, subChannelId]
  );

  const editText = useCallback(
    async (messageId: string, text: string, extras?: SendExtras) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const mentionees = extras?.mentionees;
      await editMessage({
        messageId,
        patch: {
          data: { text: trimmed },
          ...(mentionees && mentionees.length ? { mentionees } : {}),
        },
      });
    },
    [editMessage]
  );

  const removeMessage = useCallback(
    async (messageId: string) => {
      await deleteMessage(messageId);
    },
    [deleteMessage]
  );

  return {
    channel,
    isGroupChat,
    messages,
    loading,
    hasNextPage,
    loadMore,
    sendText,
    editText,
    removeMessage,
    currentUserId,
  };
}
