import { useEffect, useRef, useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../core/hooks/useAuth';

export const useTrendingCommunities = () => {
  const { isConnected } = useAuth();
  const [communities, setCommunities] = useState<Amity.Community[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribersRef = useRef<(() => void)[]>([]);

  const fetchTrendingCommunities = () => {
    setLoading(true);
    // Over-fetch by 1 (6 instead of 5) so the ExploreProvider can drop any
    // pinned-tagged community client-side and still show up to 5. The trending
    // endpoint has no server-side tag-exclude param, hence the over-fetch.
    return CommunityRepository.getTrendingCommunities(
      { limit: 6 },
      ({ error, loading, data }) => {
        setLoading(loading);
        if (error) setError(error);
        if (!loading) {
          setCommunities(data);
        }
      }
    );
  };

  const unsubscribeListener = () => {
    unsubscribersRef.current.forEach((unsubscriber) => unsubscriber());
    unsubscribersRef.current = [];
  };

  const refresh = () => {
    unsubscribeListener();
    setError(null);
    const unsubscribe = fetchTrendingCommunities();
    unsubscribersRef.current.push(unsubscribe);
  };

  useEffect(() => {
    if (!isConnected) return () => {};

    const unsubscribe = fetchTrendingCommunities();
    unsubscribersRef.current.push(unsubscribe);

    return () => unsubscribeListener();
  }, [isConnected]);

  return { communities, loading, error, refresh };
};
