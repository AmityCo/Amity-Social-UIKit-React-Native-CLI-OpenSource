// useChannelsCollection — ported from AmityUiKitWeb v4/chat/hooks/collections.
// Subscribes to the SDK's live channel collection and exposes it as React state.
//
// Web wraps a shared `useChannelCollection` (react-query backed); here we call
// `ChannelRepository.getChannels` directly — it's a live collection whose
// callback delivers `{ data, loading, hasNextPage, onNextPage }`. We keep the
// latest `onNextPage` in a ref so `loadMore()` stays stable, and re-subscribe
// whenever the query params change, returning the unsubscriber for cleanup.

import { useEffect, useRef, useState } from 'react';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';

export type UseChannelsCollectionParams = {
  types?: Amity.ChannelType[];
  membership?: 'all' | 'member' | 'notMember';
  sortBy?: 'displayName' | 'firstCreated' | 'lastCreated' | 'lastActivity';
  isDeleted?: boolean;
  limit?: number;
};

export type UseChannelsCollectionResult = {
  channels: Amity.Channel[];
  loading: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
};

const DEFAULT_LIMIT = 20;

export function useChannelsCollection({
  types,
  membership = 'member',
  sortBy = 'lastActivity',
  isDeleted = false,
  limit = DEFAULT_LIMIT,
}: UseChannelsCollectionParams = {}): UseChannelsCollectionResult {
  const [channels, setChannels] = useState<Amity.Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const onNextPageRef = useRef<(() => void) | undefined>(undefined);

  // Re-subscribe on any query-param change. `types` is an array, so key on a
  // stable string rather than its identity to avoid a resubscribe every render.
  const typesKey = types?.join(',') ?? '';

  useEffect(() => {
    setLoading(true);

    const params: Amity.ChannelLiveCollection = {
      membership,
      sortBy,
      isDeleted,
      limit,
      ...(types ? { types } : {}),
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
  }, [typesKey, membership, sortBy, isDeleted, limit]);

  function loadMore() {
    onNextPageRef.current?.();
  }

  return { channels, loading, hasNextPage, loadMore };
}
