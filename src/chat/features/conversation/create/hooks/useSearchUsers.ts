// useSearchUsers — user-search live collection for the create-conversation flow.
// Ported from AmityUiKitWeb's `useSearchUserByDisplayName`, following the RN
// `useChannelsCollection` pattern (direct SDK subscription, not react-query):
// subscribe to `UserRepository.searchUserByDisplayName`, mirror the collection
// callback into React state, and keep the latest `onNextPage` in a ref so
// `loadMore()` stays stable.
//
// The SDK requires a connected client, so the subscription is gated on
// `useAuth().isConnected` AND the caller's `enabled` flag (used to suppress the
// search for 1–2 char partial queries — an empty query still browses all users).

import { useEffect, useRef, useState } from 'react';
import { UserRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../../../core/hooks/useAuth';

export type UseSearchUsersParams = {
  displayName: string;
  limit?: number;
  /** When false, no subscription is made (e.g. 1–2 char partial queries). */
  enabled?: boolean;
};

export type UseSearchUsersResult = {
  users: Amity.InternalUser[];
  loading: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
};

const DEFAULT_LIMIT = 20;

export function useSearchUsers({
  displayName,
  limit = DEFAULT_LIMIT,
  enabled = true,
}: UseSearchUsersParams): UseSearchUsersResult {
  const [users, setUsers] = useState<Amity.InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const onNextPageRef = useRef<(() => void) | undefined>(undefined);

  const { isConnected } = useAuth();
  const shouldCall = Boolean(isConnected) && enabled;

  useEffect(() => {
    if (!shouldCall) {
      setUsers([]);
      setHasNextPage(false);
      setLoading(true);
      return undefined;
    }
    setLoading(true);

    const params: Amity.UserSearchLiveCollection = {
      displayName,
      limit,
      matchType: 'partial',
    };

    const unsub = UserRepository.searchUserByDisplayName(
      params,
      ({ data, loading: isLoading, hasNextPage: nextPage, onNextPage }) => {
        setUsers(data);
        setLoading(isLoading);
        setHasNextPage(Boolean(nextPage));
        onNextPageRef.current = onNextPage;
      }
    );

    return () => {
      unsub();
    };
  }, [shouldCall, displayName, limit]);

  function loadMore() {
    onNextPageRef.current?.();
  }

  return { users, loading, hasNextPage, loadMore };
}
