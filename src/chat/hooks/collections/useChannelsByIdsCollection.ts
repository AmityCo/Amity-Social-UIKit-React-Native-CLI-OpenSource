// useChannelsByIdsCollection — ported from AmityUiKitWeb
// v4/chat/hooks/collections/useChannelCollection (the `{ channelIds }` variant).
//
// The message-search results list resolves each matched message's channel by id.
// Web calls `useChannelCollection({ channelIds }, { shouldCall })` over
// `ChannelRepository.getChannels`; the RN `useChannelsCollection` doesn't expose
// `channelIds`, so this dedicated hook calls `ChannelRepository.getChannels`
// directly with a channelIds filter. Gated on `useAuth().isConnected` and on a
// non-empty id list. Callback: `{ data, loading, hasNextPage, onNextPage }`.

import { useEffect, useRef, useState } from 'react';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../core/hooks/useAuth';

export type UseChannelsByIdsCollectionResult = {
  channels: Amity.Channel[];
  loading: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
};

export function useChannelsByIdsCollection(
  channelIds: string[]
): UseChannelsByIdsCollectionResult {
  const [channels, setChannels] = useState<Amity.Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const onNextPageRef = useRef<(() => void) | undefined>(undefined);

  const { isConnected } = useAuth();
  const shouldCall = channelIds.length > 0;
  const idsKey = channelIds.join(',');

  useEffect(() => {
    if (!isConnected || !shouldCall) {
      setChannels([]);
      setLoading(true);
      setHasNextPage(false);
      onNextPageRef.current = undefined;
      return undefined;
    }
    setLoading(true);

    const params: Amity.ChannelLiveCollection = { channelIds };

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
  }, [isConnected, shouldCall, idsKey]);

  function loadMore() {
    onNextPageRef.current?.();
  }

  return { channels, loading, hasNextPage, loadMore };
}
