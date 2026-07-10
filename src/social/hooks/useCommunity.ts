import { useCallback, useEffect, useRef, useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';

export const useCommunity = (communityId: Amity.Community['communityId']) => {
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Amity.Community>();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const subscribe = useCallback(() => {
    unsubscribeRef.current?.();
    setLoading(true);
    unsubscribeRef.current = CommunityRepository.getCommunity(
      communityId,
      ({ error, loading, data }) => {
        setLoading(loading);
        if (error) return;
        if (!loading) {
          setCommunity(data);
        }
      }
    );
  }, [communityId]);

  useEffect(() => {
    subscribe();
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [subscribe]);

  // Re-subscribe to pull the latest community (e.g. `isJoined`) after a
  // mutation like join/leave, in case the live collection doesn't re-emit.
  const refresh = useCallback(() => subscribe(), [subscribe]);

  return { community, loading, refresh };
};
