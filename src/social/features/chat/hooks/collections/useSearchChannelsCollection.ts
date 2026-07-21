// useSearchChannelsCollection — ported from AmityUiKitWeb
// v4/chat/hooks/collections/useSearchChannelsCollection.
//
// Web wraps a shared `useLiveCollectionV4` over `ChannelRepository.searchChannels`;
// here we call `ChannelRepository.searchChannels(params, callback)` directly — a
// live collection whose callback delivers `{ data, loading, hasNextPage, onNextPage }`
// — mirroring the existing `useChannelsCollection`. We gate on `useAuth().isConnected`
// (the repository throws before the session is established) and on the caller's
// `shouldCall`, keep the latest `onNextPage` in a ref so `loadMore()` stays stable,
// and re-subscribe whenever the query params change.

import { useEffect, useRef, useState } from 'react';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../../../core/hooks/useAuth';

export type UseSearchChannelsCollectionParams =
  Amity.SearchChannelLiveCollection;

export type UseSearchChannelsCollectionResult = {
  channels: Amity.Channel[];
  loading: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
};

type UseSearchChannelsCollectionOptions = {
  shouldCall?: boolean;
};

export function useSearchChannelsCollection(
  params: UseSearchChannelsCollectionParams,
  { shouldCall = true }: UseSearchChannelsCollectionOptions = {}
): UseSearchChannelsCollectionResult {
  const [channels, setChannels] = useState<Amity.Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const onNextPageRef = useRef<(() => void) | undefined>(undefined);

  const { isConnected } = useAuth();

  const {
    query,
    exactMatch,
    isMemberOnly,
    types,
    tags,
    sortBy,
    orderBy,
    limit,
  } = params;

  // `types`/`tags` are arrays rebuilt each render — key on a stable string.
  const typesKey = types?.join(',') ?? '';
  const tagsKey = tags?.join(',') ?? '';

  useEffect(() => {
    if (!isConnected || !shouldCall) {
      setChannels([]);
      setLoading(true);
      setHasNextPage(false);
      onNextPageRef.current = undefined;
      return undefined;
    }
    setLoading(true);

    const unsub = ChannelRepository.searchChannels(
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
    shouldCall,
    query,
    exactMatch,
    isMemberOnly,
    typesKey,
    tagsKey,
    sortBy,
    orderBy,
    limit,
  ]);

  function loadMore() {
    onNextPageRef.current?.();
  }

  return { channels, loading, hasNextPage, loadMore };
}
