import { useEffect, useState } from 'react';
import { PostRepository } from '@amityco/ts-sdk-react-native';

export const usePosts = ({
  targetType,
  targetId,
  limit = 20,
}: {
  targetType: Amity.PostTargetType;
  targetId: string;
  limit?: number;
}) => {
  const [items, setItems] = useState<Amity.Post[]>();
  const [loading, setLoading] = useState(true);
  const [onNextPage, setOnNextPage] = useState<() => void | null>(null);
  useEffect(() => {
    const unsubscribe = PostRepository.getPosts(
      { targetType, limit, targetId },
      ({ error, loading, data, hasNextPage, onNextPage }) => {
        if (error) return;
        if (!loading) {
          setItems(data);
          setOnNextPage(() => {
            if (hasNextPage) return onNextPage;
            return null;
          });
        }

        setLoading(loading);
      }
    );
    return unsubscribe;
  }, [targetType, targetId, limit]);
  return { posts: items, onNextPage, loading };
};
