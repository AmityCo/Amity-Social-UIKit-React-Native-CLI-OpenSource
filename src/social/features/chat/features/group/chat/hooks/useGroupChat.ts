// useGroupChat — ported from AmityUiKitWeb v4/chat/features/group/chat/hooks/useGroupChat.
// The group-thread orchestrator: same shared useChatMessage engine as a 1-1
// conversation, plus group specifics — live channel object, the viewer's membership
// (banned / muted / moderator), the moderator id set, the muted-banner rule, and the
// open-settings navigation. Mirrors useConversation but for community channels.

import { useEffect, useMemo, useState } from 'react';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';

import useAuth from '../../../../../../../core/hooks/useAuth';
import { useChannelMembersCollection } from '../../../../hooks/collections/useChannelMembersCollection';
import { useChannelMyMembership } from '../../../../hooks/useChannelMyMembership';
import { useChatNavigation } from '../../../../hooks/useChatNavigation';
import { useChatMessage } from '../../../shared/hooks/useChatMessage';

const CHANNEL_MODERATOR = 'channel-moderator';

export type UseGroupChatParams = {
  channelId?: string;
  isJustCreated?: boolean;
};

export function useGroupChat({ channelId, isJustCreated }: UseGroupChatParams) {
  const { isConnected } = useAuth();
  const { push } = useChatNavigation();

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

  const { membership, isViewerModerator } = useChannelMyMembership(channelId);
  const isBanned = membership?.membership === 'banned';
  const isUserMuted = !!membership?.isMuted;
  const isChannelMuted = !!(channel as { isMuted?: boolean } | undefined)
    ?.isMuted;

  const { members: moderators } = useChannelMembersCollection({
    channelId: channelId ?? '',
    roles: [CHANNEL_MODERATOR],
  });
  const moderatorIds = useMemo(
    () =>
      new Set(
        moderators
          .map((m) => m.userId)
          .filter((id): id is string => typeof id === 'string')
      ),
    [moderators]
  );

  const showMutedBanner = isUserMuted || (isChannelMuted && !isViewerModerator);
  const mutedVariant: 'user' | 'channel' = isUserMuted ? 'user' : 'channel';

  const chatMessage = useChatMessage({
    channelId,
    isJustCreated,
    enableMention: true,
    viewerIsMutedInChannel: isUserMuted,
  });

  function handleOpenSettings() {
    if (channelId) push('AmityGroupSettingPage', { channelId });
  }

  return {
    ...chatMessage,
    channel,
    channelDisplayName: channel?.displayName,
    isBanned,
    isUserMuted,
    isChannelMuted,
    isModerator: isViewerModerator,
    moderatorIds,
    showMutedBanner,
    mutedVariant,
    handleOpenSettings,
  };
}
