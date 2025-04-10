import { useEffect, useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';

export const useRecommendedCommunities = () => {
  const [communities, setCommunities] = useState<Amity.Community[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = CommunityRepository.getRecommendedCommunities(
      { limit: 4 },
      ({ error, loading, data }) => {
        if (error) setError(error);
        if (!loading) {
          setLoading(loading);
          setCommunities(data);
        }
      }
    );
    return unsubscribe;
  }, []);

  return { communities, loading, error };
};
