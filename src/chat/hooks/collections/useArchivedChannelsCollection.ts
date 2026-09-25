// useArchivedChannelsCollection — ported from AmityUiKitWeb
// v4/chat/hooks/collections/useArchivedChannelsCollection.
// Subscribes to the SDK's archived-channel live collection and exposes it as
// React state.
//
// Web wraps a shared `useLiveCollectionV4`; here we mirror the RN
// `useChannelsCollection` shape and call `ChannelRepository.getArchivedChannels`
// directly — it's a live collection whose callback delivers
// `{ data, loading, hasNextPage, onNextPage }`. We keep the latest `onNextPage`
// in a ref so `loadMore()` stays stable, gate the subscription on a connected
// client, and re-subscribe when `limit` changes, returning the unsubscriber for
// cleanup. Per the SDK, the archive collection honours only `limit`.

import { useEffect, useRef, useState } from 'react';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../core/hooks/useAuth';

type Params = Parameters<typeof ChannelRepository.getArchivedChannels>[0];

export type UseArchivedChannelsCollectionResult = {
  channels: Amity.Channel[];
  loading: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
};

const DEFAULT_LIMIT = 20;

export function useArchivedChannelsCollection(
  params: Params = {}
): UseArchivedChannelsCollectionResult {
  const { limit = DEFAULT_LIMIT } = params;

  const [channels, setChannels] = useState<Amity.Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const onNextPageRef = useRef<(() => void) | undefined>(undefined);

  // ChannelRepository needs a connected client — calling getArchivedChannels
  // before the session is 'established' throws. Gate the subscription on it.
  const { isConnected } = useAuth();

  useEffect(() => {
    if (!isConnected) {
      setLoading(true);
      return undefined;
    }
    setLoading(true);

    const queryParams: Params = { limit };

    const unsub = ChannelRepository.getArchivedChannels(
      queryParams,
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
  }, [isConnected, limit]);

  function loadMore() {
    onNextPageRef.current?.();
  }

  return { channels, loading, hasNextPage, loadMore };
}
