import { useEffect, useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { filterCommunitiesByMembership } from '../utils';

export const useCommunities = ({
  categoryId,
  membership = 'member',
  limit = 20,
  sortBy = 'displayName',
}: {
  membership?: 'all' | 'member' | 'notMember';
  categoryId?: string;
  limit?: number;
  sortBy?: Amity.CommunitySortBy;
} = {}) => {
  const [communities, setCommunities] = useState<Amity.Community[]>();
  const [loading, setLoading] = useState(true);
  const [onNextCommunityPage, setOnNextCommunityPage] =
    useState<() => void | null>(null);
  useEffect(() => {
    const unsubscribe = CommunityRepository.getCommunities(
      { membership, limit, categoryId, sortBy },
      ({ error, loading, data, hasNextPage, onNextPage }) => {
        if (error) return;
        if (!loading) {
          setCommunities(filterCommunitiesByMembership(data, membership));
          setOnNextCommunityPage(() => {
            if (hasNextPage) return onNextPage;
            return null;
          });
        }

        setLoading(loading);
      }
    );
    return unsubscribe;
  }, [categoryId, membership, limit, sortBy]);
  return { communities, onNextCommunityPage, loading };
};
