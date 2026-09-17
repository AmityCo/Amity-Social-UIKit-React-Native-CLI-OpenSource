// useMessagesCollection — ported from AmityUiKitWeb v4/chat/hooks/collections/useMessagesCollection.
//
// Web wraps MessageRepository.getMessages (a live collection) and gates on
// `params.subChannelId && shouldFetch`. The RN SDK exposes the same
// `MessageRepository.getMessages(params, callback)` live collection, whose
// callback delivers `{ data, loading, error, hasNextPage, onNextPage }`.
//
// As with useChannelsCollection, the SDK needs a connected client before the
// collection can run, so we additionally gate on useAuth().isConnected. We keep
// the latest `onNextPage` in a ref so `loadMore()` stays stable, and re-subscribe
// whenever the query params change, returning the unsubscriber for cleanup.

import { useEffect, useRef, useState } from 'react';
import { MessageRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../core/hooks/useAuth';

export type UseMessagesCollectionParams = Amity.MessagesLiveCollection;

export type UseMessagesCollectionResult = {
  messages: Amity.Message[];
  loading: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
  /**
   * Only ever true for a collection opened with `aroundMessageId`: the anchored
   * page has NEWER messages below it. A collection opened at the newest page has
   * nothing after it.
   */
  hasPrevPage: boolean;
  loadPrev: () => void;
  error: unknown;
};

export function useMessagesCollection(
  params: UseMessagesCollectionParams,
  shouldFetch = true
): UseMessagesCollectionResult {
  const [messages, setMessages] = useState<Amity.Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [error, setError] = useState<unknown>(undefined);
  const onNextPageRef = useRef<(() => void) | undefined>(undefined);
  const onPrevPageRef = useRef<(() => void) | undefined>(undefined);

  // The SDK's MessageRepository needs a connected client — calling getMessages
  // before the session is 'established' throws. Gate the subscription on it.
  const { isConnected } = useAuth();

  const {
    subChannelId,
    limit,
    sortBy,
    includingTags,
    excludingTags,
    includeDeleted,
    aroundMessageId,
  } = params;

  useEffect(() => {
    if (!isConnected || !subChannelId || !shouldFetch) {
      setLoading(true);
      return undefined;
    }
    setLoading(true);

    const unsub = MessageRepository.getMessages(
      params,
      ({
        data,
        loading: isLoading,
        error: err,
        hasNextPage: nextPage,
        onNextPage,
        hasPrevPage: prevPage,
        onPrevPage,
      }) => {
        setLoading(isLoading);
        if (!isLoading && data) {
          setMessages([...data]);
          setHasNextPage(Boolean(nextPage));
          onNextPageRef.current = nextPage ? onNextPage : undefined;
          setHasPrevPage(Boolean(prevPage));
          onPrevPageRef.current = prevPage ? onPrevPage : undefined;
        }
        if (err) setError(err);
      }
    );

    return () => {
      unsub();
    };
    // `params` is rebuilt each render; key on its stable primitive fields.
  }, [
    isConnected,
    shouldFetch,
    subChannelId,
    limit,
    sortBy,
    includingTags?.join(','),
    excludingTags?.join(','),
    includeDeleted,
    aroundMessageId,
  ]);

  function loadMore() {
    onNextPageRef.current?.();
  }

  function loadPrev() {
    onPrevPageRef.current?.();
  }

  return {
    messages,
    loading,
    hasNextPage,
    loadMore,
    hasPrevPage,
    loadPrev,
    error,
  };
}
