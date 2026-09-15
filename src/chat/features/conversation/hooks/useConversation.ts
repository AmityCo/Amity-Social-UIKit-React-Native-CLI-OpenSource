// useConversation — RN equivalent of AmityUiKitWeb v4/chat/features/conversation/chat/hooks/useChat.
// Thin wrapper: fetches the live channel (for group-vs-direct behaviour + the muted
// banner) and delegates all message orchestration to useChatMessage. Chat.tsx consumes
// the combined result.

import { useEffect, useState } from 'react';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';

import useAuth from '../../../../core/hooks/useAuth';
import { useFollowInfo } from '../../../hooks/useFollowInfo';
import { useChatMessage } from '../../shared/hooks/useChatMessage';

export function useConversation(channelId?: string) {
  const { isConnected } = useAuth();

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

  const chat = useChatMessage({ channelId, enableMention: isGroupChat });

  // The other participant in a 1-1 conversation (for the header user-action menu),
  // resolved from the channel preview members like AmityChatListItem does.
  const otherUser = channel?.previewMembers?.find(
    (m) => m.userId !== chat.currentUserId
  )?.user as Amity.InternalUser | undefined;

  // Block state for the 1-1 conversation, mirroring web useChat:
  // `const { isBlockedByMe: isUserBlocked } = useFollowInfo({ userId })`.
  // Chat.tsx renders MutedBanner INSTEAD of the composer when showMutedBanner is
  // set, so surfacing this is what removes the compose bar once the viewer blocks
  // the other participant (PDT-5281).
  const { isBlockedByMe: isUserBlocked } = useFollowInfo(otherUser?.userId);

  // Muted/blocked banner: the RN SDK exposes the viewer's channel membership mute via
  // channel.isMuted for the current user. Block outranks mute — web's conversation
  // useChat only ever shows the 'blocked' variant, and a blocked 1-1 chat is
  // unusable regardless of mute state, so it wins when both are true.
  const isChannelMuted = Boolean(
    (channel as { isMuted?: boolean } | undefined)?.isMuted
  );
  const showMutedBanner = isUserBlocked || isChannelMuted;
  const mutedVariant: 'user' | 'channel' | 'blocked' = isUserBlocked
    ? 'blocked'
    : 'channel';

  return {
    ...chat,
    channel,
    otherUser,
    isGroupChat,
    isUserBlocked,
    showMutedBanner,
    mutedVariant,
  };
}
