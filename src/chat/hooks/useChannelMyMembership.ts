// useChannelMyMembership — ported from AmityUiKitWeb
// v4/chat/hooks/objects/useChannelMyMembership (+ useGroupMembers' viewer-role read).
//
// Web reads the viewer's own channel membership as a live object via
// `channel.myMembership(callback)` and derives moderator status from its roles.
// RN has no `useChannelObject`/`useLiveObjectV4`, so this hook does both hops
// itself: subscribe to `ChannelRepository.getChannel` for the channel model, then
// to that model's `myMembership` live object, and expose `isViewerModerator`
// through the shared `isModerator` role util. Gated on `useAuth().isConnected`.

import { useEffect, useState } from 'react';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../core/hooks/useAuth';
import { isModerator } from '../../core/utils/role';

type ChannelMembership = Amity.Membership<'channel'>;

export type UseChannelMyMembershipResult = {
  membership?: ChannelMembership;
  isViewerModerator: boolean;
};

export function useChannelMyMembership(
  channelId?: string
): UseChannelMyMembershipResult {
  const { isConnected } = useAuth();
  const [channel, setChannel] = useState<Amity.Channel | undefined>(undefined);
  const [membership, setMembership] = useState<ChannelMembership | undefined>(
    undefined
  );

  useEffect(() => {
    if (!isConnected || !channelId) return undefined;
    const unsub = ChannelRepository.getChannel(channelId, ({ data }) => {
      if (data) setChannel(data);
    });
    return () => {
      unsub();
    };
  }, [isConnected, channelId]);

  useEffect(() => {
    if (!channel) return undefined;
    const unsub = channel.myMembership(({ data }) => {
      setMembership(data ?? undefined);
    });
    return () => {
      unsub();
    };
  }, [channel]);

  return {
    membership,
    isViewerModerator: isModerator(membership?.roles),
  };
}
