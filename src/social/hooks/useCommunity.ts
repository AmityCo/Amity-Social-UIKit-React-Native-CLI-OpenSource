import { useCommunity as useCommunityObject } from '../../core/hooks/objects';

export const useCommunity = (communityId: Amity.Community['communityId']) => {
  const { community, isLoading } = useCommunityObject({ communityId });
  return { community, loading: isLoading };
};
