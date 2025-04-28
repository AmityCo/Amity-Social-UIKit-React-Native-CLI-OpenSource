import { useEffect, useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../hooks/useAuth';

type UseRecommendedCommunitiesOptions = {
  limit?: number;
};

export const useRecommendedCommunities = (
  options?: UseRecommendedCommunitiesOptions
) => {
  const { limit = 4 } = options || {};
  const { isConnected } = useAuth();
  const [communities, setCommunities] = useState<Amity.Community[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendedCommunities = () => {
    setLoading(true);
    return CommunityRepository.getRecommendedCommunities(
      { limit: 100 },
      ({ error, loading, data }) => {
        if (error) setError(error);
        if (!loading) {
          setLoading(loading);
          setCommunities(data.filter((community) => !community.isJoined));
        }
      }
    );
  };

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = fetchRecommendedCommunities();
    return unsubscribe;
  }, [isConnected]);

  return {
    communities: communities?.slice(0, limit),
    loading,
    error,
  };
};
