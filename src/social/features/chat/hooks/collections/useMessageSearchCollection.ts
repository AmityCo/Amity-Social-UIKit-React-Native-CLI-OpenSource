// useMessageSearchCollection — ported from AmityUiKitWeb
// v4/chat/hooks/collections/useMessageSearchCollection.
//
// Web wraps `useLiveCollectionV4` over `MessageRepository.searchMessage` with
// `{ query, limit: LIST_PAGE_LIMIT }`, gating on a trimmed query length. The RN
// SDK exposes the same `MessageRepository.searchMessage(params, callback)` live
// collection (callback: `{ data, loading, hasNextPage, onNextPage }`). We gate on
// `useAuth().isConnected` and on the trimmed query reaching SEARCH_MIN_QUERY_LENGTH,
// keep the latest `onNextPage` in a ref, and re-subscribe when the query changes.

import { useEffect, useRef, useState } from 'react';
import { MessageRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../../../core/hooks/useAuth';
import { LIST_PAGE_LIMIT, SEARCH_MIN_QUERY_LENGTH } from '../../constants';

export type UseMessageSearchCollectionParams = {
  query: string;
};

export type UseMessageSearchCollectionResult = {
  messages: Amity.Message[];
  loading: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
};

export function useMessageSearchCollection({
  query,
}: UseMessageSearchCollectionParams): UseMessageSearchCollectionResult {
  const [messages, setMessages] = useState<Amity.Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const onNextPageRef = useRef<(() => void) | undefined>(undefined);

  const { isConnected } = useAuth();

  const trimmed = query.trim();
  const shouldCall = trimmed.length >= SEARCH_MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!isConnected || !shouldCall) {
      setMessages([]);
      setLoading(true);
      setHasNextPage(false);
      onNextPageRef.current = undefined;
      return undefined;
    }
    setLoading(true);

    const params: Amity.SearchMessageLiveCollection = {
      query: trimmed,
      limit: LIST_PAGE_LIMIT,
    };

    const unsub = MessageRepository.searchMessage(
      params,
      ({ data, loading: isLoading, hasNextPage: nextPage, onNextPage }) => {
        setMessages(data);
        setLoading(isLoading);
        setHasNextPage(Boolean(nextPage));
        onNextPageRef.current = onNextPage;
      }
    );

    return () => {
      unsub();
    };
  }, [isConnected, shouldCall, trimmed]);

  function loadMore() {
    onNextPageRef.current?.();
  }

  return { messages, loading, hasNextPage, loadMore };
}
