// useChannelMembersCollection — ported from AmityUiKitWeb
// v4/chat/hooks/collections/useChannelMembersCollection.
//
// Web wraps a shared `useLiveCollectionV4` around
// `ChannelRepository.Membership.getMembers`; RN subscribes to that live
// collection directly, following the sibling `useChannelsCollection` pattern:
// mirror the callback into React state, keep the latest `onNextPage` in a ref so
// `loadMore()` stays stable, and gate on `useAuth().isConnected` (the SDK needs a
// connected client). The effect keys on stable joined strings of the array
// params (`memberships`, `roles`) so it does not resubscribe every render.

import { useEffect, useRef, useState } from 'react';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../core/hooks/useAuth';

type Membership = Amity.Membership<'channel'>;

export type UseChannelMembersCollectionParams = {
  channelId: string;
  memberships?: Amity.ChannelMembersLiveCollection['memberships'];
  roles?: string[];
  search?: string;
  limit?: number;
};

export type UseChannelMembersCollectionResult = {
  members: Membership[];
  isLoadingFirstPage: boolean;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
};

const DEFAULT_LIMIT = 20;

export function useChannelMembersCollection({
  channelId,
  memberships,
  roles,
  search,
  limit = DEFAULT_LIMIT,
}: UseChannelMembersCollectionParams): UseChannelMembersCollectionResult {
  const [members, setMembers] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFirstPage, setIsLoadingFirstPage] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const onNextPageRef = useRef<(() => void) | undefined>(undefined);

  const { isConnected } = useAuth();

  // Arrays are keyed on a stable string rather than identity to avoid a
  // resubscribe on every render (mirrors useChannelsCollection's `typesKey`).
  const membershipsKey = memberships?.join(',') ?? '';
  const rolesKey = roles?.join(',') ?? '';

  useEffect(() => {
    if (!isConnected || !channelId) {
      setIsLoading(true);
      setIsLoadingFirstPage(true);
      return undefined;
    }
    setIsLoading(true);
    setIsLoadingFirstPage(true);

    // PDT-5236: `getMembers` takes a `search` filter, but it does not match from
    // the first character — a one-letter query came back empty even with members
    // whose display name starts with it. The SDK's dedicated
    // `Membership.searchMembers` collection is the one built for keyword search
    // (it is what useMention already uses, and what the Flutter UIKit QA
    // compared against uses here). Route a non-empty query through it and keep
    // `getMembers` for the unfiltered list. LEADS WEB — web's MemberList still
    // passes `search` to getMembers.
    const keyword = search?.trim() ?? '';
    const handleSnapshot = ({
      data,
      loading,
      hasNextPage,
      onNextPage,
    }: Amity.LiveCollection<Membership>) => {
      setMembers(data);
      setIsLoading(loading);
      if (!loading) setIsLoadingFirstPage(false);
      setHasMore(Boolean(hasNextPage));
      onNextPageRef.current = onNextPage;
    };

    const unsub = keyword
      ? ChannelRepository.Membership.searchMembers(
          {
            channelId,
            search: keyword,
            limit,
            includeDeleted: false,
            ...(memberships ? { memberships } : {}),
            ...(roles ? { roles } : {}),
          },
          handleSnapshot
        )
      : ChannelRepository.Membership.getMembers(
          {
            channelId,
            limit,
            ...(memberships ? { memberships } : {}),
            ...(roles ? { roles } : {}),
          },
          handleSnapshot
        );

    return () => {
      unsub();
    };
  }, [isConnected, channelId, membershipsKey, rolesKey, search, limit]);

  function loadMore() {
    onNextPageRef.current?.();
  }

  return { members, isLoadingFirstPage, isLoading, hasMore, loadMore };
}
