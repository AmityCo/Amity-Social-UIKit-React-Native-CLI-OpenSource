import { useEffect, useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../hooks/useAuth';

export const useTrendingCommunities = () => {
  const { isConnected } = useAuth();
  const [communities, setCommunities] = useState<Amity.Community[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = CommunityRepository.getTrendingCommunities(
      { limit: 5 },
      ({ error, loading, data }) => {
        if (error) setError(error);
        if (!loading) {
          setLoading(loading);
          setCommunities(data);
        }
      }
    );
    return unsubscribe;
  }, [isConnected]);

  return { communities, loading, error };
};
