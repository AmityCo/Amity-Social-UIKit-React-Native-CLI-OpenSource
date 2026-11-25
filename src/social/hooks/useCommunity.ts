import { useEffect, useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';

export const useCommunity = (communityId?: Amity.Community['communityId']) => {
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<Amity.Community>();

  useEffect(() => {
    // Nothing to watch, e.g. a post on a user's timeline: don't ask the SDK
    // for an empty id.
    if (!communityId) {
      setCommunity(undefined);
      setLoading(false);
      return undefined;
    }
    const unsubscribe = CommunityRepository.getCommunity(
      communityId,
      ({ error, loading, data }) => {
        setLoading(loading);
        if (error) return;
        if (!loading) {
          setCommunity(data);
        }
      }
    );
    return () => {
      unsubscribe();
    };
  }, [communityId]);
  return { community, loading };
};
