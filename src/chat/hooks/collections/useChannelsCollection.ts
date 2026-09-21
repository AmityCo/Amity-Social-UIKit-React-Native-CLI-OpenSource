// useChannelsCollection — ported from AmityUiKitWeb v4/chat/hooks/collections.
// Subscribes to the SDK's live channel collection and exposes it as React state.
//
// Web wraps a shared `useChannelCollection` (react-query backed); here we call
// `ChannelRepository.getChannels` directly — it's a live collection whose
// callback delivers `{ data, loading, hasNextPage, onNextPage }`. We keep the
// latest `onNextPage` in a ref so `loadMore()` stays stable, and re-subscribe
// whenever the query params change, returning the unsubscriber for cleanup.
//
// `refreshOnFocus` re-subscribes each time the hosting screen regains focus.
// The SDK's `createChannel` only writes the new channel into the cache and
// fires no local event, and the channel live collection inserts an id only on
// the realtime `channel.created` / `channel.joined` events (a sent message is
// an `onUpdate`, which never inserts). So a conversation created from the home
// screen's child routes is missing from the list until it re-subscribes; the
// focus refresh does that. Rows stay in state across the refresh, so the list
// does not flash to a skeleton. Same pattern as core `useLiveObject`.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../core/hooks/useAuth';

export type UseChannelsCollectionParams = {
  types?: Amity.ChannelType[];
  membership?: 'all' | 'member' | 'notMember';
  sortBy?: 'displayName' | 'firstCreated' | 'lastCreated' | 'lastActivity';
  isDeleted?: boolean;
  limit?: number;
  /** Drop archived channels from the collection (web home list passes true). */
  excludeArchives?: boolean;
  /**
   * Re-subscribe when the hosting screen regains focus (see header). Requires
   * a React Navigation screen ancestor. Defaults to false.
   */
  refreshOnFocus?: boolean;
};

export type UseChannelsCollectionResult = {
  channels: Amity.Channel[];
  loading: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
  /** Re-subscribe now, keeping the current rows until the fresh page lands. */
  refresh: () => void;
};

const DEFAULT_LIMIT = 20;

export function useChannelsCollection({
  types,
  membership = 'member',
  sortBy = 'lastActivity',
  isDeleted = false,
  limit = DEFAULT_LIMIT,
  excludeArchives,
  refreshOnFocus = false,
}: UseChannelsCollectionParams = {}): UseChannelsCollectionResult {
  const [channels, setChannels] = useState<Amity.Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const onNextPageRef = useRef<(() => void) | undefined>(undefined);
  // Bumped by `refresh()`; a dep of the subscription effect so it re-subscribes.
  const [refreshKey, setRefreshKey] = useState(0);

  // The SDK's ChannelRepository needs a connected client — calling getChannels
  // before the session is 'established' throws. Gate the subscription on it.
  const { isConnected } = useAuth();

  // Re-subscribe on any query-param change. `types` is an array, so key on a
  // stable string rather than its identity to avoid a resubscribe every render.
  const typesKey = types?.join(',') ?? '';

  useEffect(() => {
    if (!isConnected) {
      setLoading(true);
      return undefined;
    }
    setLoading(true);

    const params: Amity.ChannelLiveCollection = {
      membership,
      sortBy,
      isDeleted,
      limit,
      ...(types ? { types } : {}),
      ...(excludeArchives ? { excludeArchives: true } : {}),
    };

    const unsub = ChannelRepository.getChannels(
      params,
      ({ data, loading: isLoading, hasNextPage: nextPage, onNextPage }) => {
        setChannels(data);
        setLoading(isLoading);
        setHasNextPage(Boolean(nextPage));
        onNextPageRef.current = onNextPage;
      }
    );

    return () => {
      unsub();
    };
  }, [
    isConnected,
    typesKey,
    membership,
    sortBy,
    isDeleted,
    limit,
    excludeArchives,
    refreshKey,
  ]);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  // The first focus coincides with mount, which the effect above already
  // subscribed for — only later focuses (returning from a child route) refresh.
  const hasFocusedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!refreshOnFocus) return undefined;
      if (hasFocusedRef.current) {
        refresh();
      } else {
        hasFocusedRef.current = true;
      }
      return undefined;
    }, [refreshOnFocus, refresh])
  );

  function loadMore() {
    onNextPageRef.current?.();
  }

  return { channels, loading, hasNextPage, loadMore, refresh };
}
