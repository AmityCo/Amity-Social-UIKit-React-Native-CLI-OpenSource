// useFollowInfo — ported from AmityUiKitWeb v4/chat/hooks/objects/useFollowInfo.
//
// Web resolves the viewer↔user relationship as a live object through
// `useLiveObjectV4({ fetcher: UserRepository.Relationship.getFollowInfo })` and
// derives `isBlockedByMe` from `status === 'blocked'`. RN has no
// `useLiveObjectV4`, so this hook subscribes to the same repository callback
// directly (the pattern useChannelMyMembership uses) and exposes the same shape.
//
// Kept live rather than one-shot: both consumers depend on the block state
// flipping in place — the conversation swaps its composer for the blocked banner
// (PDT-5281) and the user-action menu flips its Block ↔ Unblock label — without
// a remount. Gated on `useAuth().isConnected`.

import { useEffect, useState } from 'react';
import { UserRepository } from '@amityco/ts-sdk-react-native';

import useAuth from '../../core/hooks/useAuth';

type FollowInfoUserId = Parameters<
  typeof UserRepository.Relationship.getFollowInfo
>[0];

export type UseFollowInfoResult = {
  followInfo?: Amity.FollowInfo;
  status?: Amity.FollowInfo['status'];
  isBlockedByMe: boolean;
};

export function useFollowInfo(userId?: FollowInfoUserId): UseFollowInfoResult {
  const { isConnected } = useAuth();
  const [followInfo, setFollowInfo] = useState<Amity.FollowInfo | undefined>(
    undefined
  );

  useEffect(() => {
    if (!isConnected || !userId) {
      // Drop any relationship resolved for a previous user so a stale
      // `isBlockedByMe` can never leak into the next conversation.
      setFollowInfo(undefined);
      return undefined;
    }
    const unsub = UserRepository.Relationship.getFollowInfo(
      userId,
      ({ data }) => {
        setFollowInfo(data ?? undefined);
      }
    );
    return () => {
      unsub();
    };
  }, [isConnected, userId]);

  const status = followInfo?.status;

  return {
    followInfo,
    status,
    isBlockedByMe: status === 'blocked',
  };
}
