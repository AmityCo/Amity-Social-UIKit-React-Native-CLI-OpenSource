import { useCallback, useEffect, useState } from 'react';
import { EventRepository } from '@amityco/ts-sdk-react-native';

/**
 * Web parity: useEvent — observes a single event as a Live Object and cleans
 * up the subscription on unmount.
 */
export const useEvent = ({
  eventId,
  shouldCall = true,
}: {
  eventId?: string;
  shouldCall?: boolean;
}) => {
  const [event, setEvent] = useState<Amity.Event | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    if (!eventId || !shouldCall) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const unsubscribe = EventRepository.getEvent(
      eventId,
      ({ data, error: objectError, loading: isLoading }) => {
        if (objectError) {
          setError(objectError);
          setLoading(false);
          return;
        }
        if (!isLoading) setEvent(data);
        setLoading(isLoading);
      }
    );
    return unsubscribe;
  }, [eventId, shouldCall, refreshNonce]);

  const refresh = useCallback(() => {
    setRefreshNonce((nonce) => nonce + 1);
  }, []);

  return { event, error, isLoading: loading, refresh };
};
