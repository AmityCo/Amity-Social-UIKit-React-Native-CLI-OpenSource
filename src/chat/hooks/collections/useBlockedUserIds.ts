// useBlockedUserIds — the ids of every user the viewer has blocked, as a Set.
//
// Chat search has no block filter: the SDK's channel search params carry none,
// and its client-side block filtering covers posts and comments only. The home
// chat list is scoped server-side, so a blocked 1:1 conversation disappears
// there but still surfaces in search results. The search tabs use this set to
// hide those conversations themselves.
//
// Follows the RN direct-subscription collection pattern (see
// useArchivedChannelsCollection): subscribe to `UserRepository.getBlockedUsers`,
// gated on a connected client, and mirror the collection into React state. The
// collection is paged, so the callback pulls every remaining page before the
// set is reported complete — a viewer with more blocked users than one page
// must not leak the overflow. The subscription is live: blocking or unblocking
// updates the set in place without a remount.

import { useEffect, useState } from 'react';
import { UserRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../core/hooks/useAuth';

export type UseBlockedUserIdsResult = {
  blockedUserIds: ReadonlySet<string>;
  /** True until every page of the blocked-user collection has arrived. */
  loading: boolean;
};

const PAGE_LIMIT = 100;
const EMPTY_SET: ReadonlySet<string> = new Set<string>();

export function useBlockedUserIds(): UseBlockedUserIdsResult {
  const [blockedUserIds, setBlockedUserIds] =
    useState<ReadonlySet<string>>(EMPTY_SET);
  const [loading, setLoading] = useState(true);

  // UserRepository needs a connected client — subscribing before the session
  // is 'established' throws. Gate on it.
  const { isConnected } = useAuth();

  useEffect(() => {
    if (!isConnected) {
      setBlockedUserIds(EMPTY_SET);
      setLoading(true);
      return undefined;
    }
    setLoading(true);

    const unsub = UserRepository.getBlockedUsers(
      { limit: PAGE_LIMIT },
      ({ data, loading: isLoading, hasNextPage, onNextPage }) => {
        setBlockedUserIds(new Set(data.map((user) => user.userId)));
        // Keep paging until the collection is exhausted; stay `loading` until then.
        if (!isLoading && hasNextPage) {
          onNextPage?.();
          return;
        }
        setLoading(isLoading);
      }
    );

    return () => {
      unsub();
    };
  }, [isConnected]);

  return { blockedUserIds, loading };
}
