import { useEffect, useState } from 'react';
import { PostRepository } from '@amityco/ts-sdk-react-native';

export const usePosts = ({
  targetType,
  targetId,
  feedType,
  limit = 20,
}: {
  targetType: Amity.PostTargetType;
  targetId: string;
  feedType?: Amity.QueryPosts['feedType'];
  limit?: number;
}) => {
  const [items, setItems] = useState<Amity.Post[]>();
  const [loading, setLoading] = useState(true);
  const [onNextPage, setOnNextPage] = useState<() => void | null>(null);
  useEffect(() => {
    const unsubscribe = PostRepository.getPosts(
      { targetType, limit, targetId, feedType },
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
  }, [targetType, targetId, limit, feedType]);
  return { posts: items, onNextPage, loading };
};
