import { useCallback, useEffect, useRef, useState } from 'react';
import { AmityEventResponseStatus } from '@amityco/ts-sdk-react-native';

/**
 * Web parity: useRSVPEventsCollection — observes an event's RSVP responses
 * (attendees) as a Live Collection via the event link object's getRSVPs.
 */
export const useRSVPCollection = ({
  event,
  status = AmityEventResponseStatus.Going,
  limit = 20,
  shouldCall = true,
}: {
  event?: Amity.Event;
  status?: Amity.EventResponseStatus;
  limit?: number;
  shouldCall?: boolean;
}) => {
  const [rsvps, setRsvps] = useState<Amity.EventResponse[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const onNextPageRef = useRef<(() => void) | null>(null);
  const receivedFirstPageRef = useRef(false);

  useEffect(() => {
    if (!event || !shouldCall) {
      setLoading(false);
      return undefined;
    }
    receivedFirstPageRef.current = false;
    setLoading(true);
    const unsubscribe = event.getRSVPs(
      { status, options: { limit } },
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
          setRsvps(data ?? []);
          setHasMore(!!hasNextPage);
          onNextPageRef.current = hasNextPage ? onNextPage : null;
        }
        setLoading(isLoading);
      }
    );
    return unsubscribe;
  }, [event?.eventId, status, limit, shouldCall]);

  const loadMore = useCallback(() => {
    onNextPageRef.current?.();
  }, []);

  return {
    rsvps,
    error,
    isLoading: loading,
    isLoadingFirstPage: loading && !receivedFirstPageRef.current,
    hasMore,
    loadMore,
  };
};
