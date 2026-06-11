import { useCallback, useEffect, useRef, useState } from 'react';
import { EventRepository } from '@amityco/ts-sdk-react-native';

type UseEventsCollectionParams = Parameters<
  typeof EventRepository.getEvents
>[0] & {
  shouldCall?: boolean;
};

/**
 * Web parity: useEventsCollection — wraps EventRepository.getEvents as a Live
 * Collection (observe callback, explicit pageSize, onNextPage/hasNextPage
 * pagination) with subscription cleanup on unmount.
 */
export const useEventsCollection = ({
  shouldCall = true,
  limit = 20,
  userId,
  originId,
  onlyAttendee,
  type,
  status,
  originType,
  sortBy,
  orderBy,
}: UseEventsCollectionParams) => {
  const [events, setEvents] = useState<Amity.Event[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const onNextPageRef = useRef<(() => void) | null>(null);
  const receivedFirstPageRef = useRef(false);

  useEffect(() => {
    if (!shouldCall) {
      setLoading(false);
      return undefined;
    }
    receivedFirstPageRef.current = false;
    setLoading(true);
    const unsubscribe = EventRepository.getEvents(
      {
        limit,
        userId,
        originId,
        onlyAttendee,
        type,
        status,
        originType,
        sortBy,
        orderBy,
      },
      ({
        data,
        error: collectionError,
        loading: isLoading,
        hasNextPage,
        onNextPage,
      }) => {
        if (collectionError) {
          setError(collectionError);
          setLoading(false);
          return;
        }
        if (!isLoading) {
          receivedFirstPageRef.current = true;
          setEvents(data ?? []);
          setHasMore(!!hasNextPage);
          onNextPageRef.current = hasNextPage ? onNextPage : null;
        }
        setLoading(isLoading);
      }
    );
    return unsubscribe;
  }, [
    shouldCall,
    limit,
    userId,
    originId,
    onlyAttendee,
    type,
    status,
    originType,
    sortBy,
    orderBy,
    refreshNonce,
  ]);

  const loadMore = useCallback(() => {
    onNextPageRef.current?.();
  }, []);

  const refresh = useCallback(() => {
    setRefreshNonce((nonce) => nonce + 1);
  }, []);

  return {
    events,
    error,
    isLoading: loading,
    isLoadingFirstPage: loading && !receivedFirstPageRef.current,
    hasMore,
    loadMore,
    refresh,
  };
};
