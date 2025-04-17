import { useEffect, useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';

type UseRecommendedCommunitiesOptions = {
  limit?: number;
};

export const useRecommendedCommunities = (
  options?: UseRecommendedCommunitiesOptions
) => {
  const { limit = 4 } = options || {};

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
          console.log('Recommended communities:', data.length);
          setCommunities(data.filter((community) => !community.isJoined));
        }
      }
    );
  };

  useEffect(() => {
    const unsubscribe = fetchRecommendedCommunities();
    return unsubscribe;
  }, []);

  return {
    communities: communities?.slice(0, limit),
    loading,
    error,
    refresh: () => fetchRecommendedCommunities,
  };
};
