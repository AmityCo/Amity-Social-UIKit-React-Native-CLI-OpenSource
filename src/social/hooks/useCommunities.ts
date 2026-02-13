import { useEffect, useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';

export const useCommunities = ({
  categoryId,
  membership = 'member',
  limit = 20,
}: {
  membership?: 'all' | 'member' | 'notMember';
  categoryId?: string;
  limit?: number;
} = {}) => {
  const [communities, setCommunities] = useState<Amity.Community[]>();
  const [loading, setLoading] = useState(true);
  const [onNextCommunityPage, setOnNextCommunityPage] =
    useState<() => void | null>(null);
  useEffect(() => {
    const unsubscribe = CommunityRepository.getCommunities(
      { membership, limit, categoryId },
      ({ error, loading, data, hasNextPage, onNextPage }) => {
        if (error) return;
        if (!loading) {
          setCommunities(data);
          setOnNextCommunityPage(() => {
            if (hasNextPage) return onNextPage;
            return null;
          });
        }

        setLoading(loading);
      }
    );
    return unsubscribe;
  }, [categoryId, membership, limit]);
  return { communities, onNextCommunityPage, loading };
};
