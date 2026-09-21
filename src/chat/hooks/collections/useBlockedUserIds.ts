// useBlockedUserIds — the ids of every user the viewer has blocked, as a Set.
//
// Chat search has no block filter: the SDK's channel search params carry none,
// and its client-side block filtering covers posts and comments only. The home
// chat list is scoped server-side, so a blocked 1:1 conversation disappears
// there but still surfaces in search results. The search tabs use this set to
// hide those conversations themselves.
//
// Wraps the shared `useLiveCollection` (core/hooks/collections) around
// `UserRepository.getBlockedUsers`, gated on a connected client. The
// collection is paged, so an effect keeps calling `loadMore` until it is
// exhausted — a viewer with more blocked users than one page must not leak
// the overflow. The subscription is live: blocking or unblocking updates the
// set in place without a remount.

import { useEffect, useMemo } from 'react';
import { UserRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../core/hooks/useAuth';
import { useLiveCollection } from '../../../core/hooks/collections';

export type UseBlockedUserIdsResult = {
  blockedUserIds: ReadonlySet<string>;
};

const PAGE_LIMIT = 100;
const EMPTY_SET: ReadonlySet<string> = new Set<string>();

export function useBlockedUserIds(): UseBlockedUserIdsResult {
  // UserRepository needs a connected client — subscribing before the session
  // is 'established' throws. Gate on it.
  const { isConnected } = useAuth();
  const enabled = Boolean(isConnected);

  const { items, isLoading, isLoadingFirstPage, hasMore, loadMore } =
    useLiveCollection({
      fetcher: UserRepository.getBlockedUsers,
      params: { limit: PAGE_LIMIT },
      enabled,
    });

  // Keep paging until the collection is exhausted.
  useEffect(() => {
    if (enabled && !isLoadingFirstPage && !isLoading && hasMore) {
      loadMore();
    }
  }, [enabled, isLoadingFirstPage, isLoading, hasMore, loadMore]);

  const blockedUserIds = useMemo<ReadonlySet<string>>(
    () => (enabled ? new Set(items.map((user) => user.userId)) : EMPTY_SET),
    [enabled, items]
  );

  return { blockedUserIds };
}
