// useConversation — RN equivalent of AmityUiKitWeb v4/chat/features/conversation/chat/hooks/useChat.
// Thin wrapper: fetches the live channel (for group-vs-direct behaviour + the muted
// banner) and delegates all message orchestration to useChatMessage. Chat.tsx consumes
// the combined result.

import { useEffect, useState } from 'react';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';

import useAuth from '../../../../../../core/hooks/useAuth';
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

  // Muted/blocked banner: the RN SDK exposes the viewer's channel membership mute via
  // channel.isMuted for the current user; block status (web useFollowInfo) has no RN
  // equivalent wired yet, so the 'blocked' variant is not surfaced here.
  const isChannelMuted = Boolean(
    (channel as { isMuted?: boolean } | undefined)?.isMuted
  );
  const showMutedBanner = isChannelMuted;
  const mutedVariant: 'user' | 'channel' | 'blocked' = 'channel';

  return {
    ...chat,
    channel,
    isGroupChat,
    showMutedBanner,
    mutedVariant,
  };
}
