import { useEffect, useRef, useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../core/hooks/useAuth';

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
    // Drop the just-joined community from the list. The initial fetch only
    // keeps `!isJoined` communities, so once joined it should disappear too.
    // (Previously this used `.filter` but returned objects instead of
    // booleans, so every item was kept and nothing was ever removed.)
    setCommunities((prev) =>
      prev?.filter((community) => community.communityId !== communityId)
    );
  };

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
