import { useEffect, useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';

export const useCommunities = ({
  categoryId,
}: {
  categoryId?: string;
} = {}) => {
  const [communities, setCommunities] = useState<Amity.Community[]>();
  const [loading, setLoading] = useState(true);
  const [onNextCommunityPage, setOnNextCommunityPage] =
    useState<() => void | null>(null);
  useEffect(() => {
    const unsubscribe = CommunityRepository.getCommunities(
      { membership: 'member', limit: 20, categoryId },
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
  }, [categoryId]);
  return { communities, onNextCommunityPage, loading };
};
