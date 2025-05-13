import { useEffect, useRef, useState } from 'react';
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
  const unsubscribersRef = useRef<(() => void)[]>([]);

  const fetchRecommendedCommunities = () => {
    setLoading(true);
    return CommunityRepository.getRecommendedCommunities(
      { limit: 100 },
      ({ error, loading, data }) => {
        setLoading(loading);
        if (error) setError(error);
        if (!loading) {
          console.log('fetchRecommendedCommunities', data.length);
          setCommunities(data.filter((community) => !community.isJoined));
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
    const unsubscribe = fetchRecommendedCommunities();
    unsubscribersRef.current.push(unsubscribe);
  };

  const onJoinCommunity = (communityId: string) => {
    setCommunities((prev) => [
      ...prev?.filter((community) => {
        if (community.communityId === communityId) {
          return {
            ...community,
            isJoined: true,
          };
        }
        return community;
      }),
    ]);
  };

  useEffect(() => {
    console.log('Recommended communities:', communities?.length);
  }, [communities]);

  useEffect(() => {
    if (!isConnected) return () => {};

    const unsubscribe = fetchRecommendedCommunities();
    unsubscribersRef.current.push(unsubscribe);

    return () => unsubscribeListener();
  }, [isConnected]);

  return {
    refresh,
    onJoinCommunity,
    communities: communities?.slice(0, limit),
    loading,
    error,
  };
};
