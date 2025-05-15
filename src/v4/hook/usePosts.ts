import { useEffect, useState } from 'react';
import { PostRepository } from '@amityco/ts-sdk-react-native';

export const usePosts = ({
  targetType,
  targetId,
  feedType,
  dataTypes,
  limit = 20,
}: {
  targetType: Amity.PostTargetType;
  targetId: string;
  feedType?: Amity.QueryPosts['feedType'];
  dataTypes?: Amity.PostContentType[];
  limit?: number;
}) => {
  const [items, setItems] = useState<Amity.Post[]>();
  const [loading, setLoading] = useState(true);
  const [onNextPage, setOnNextPage] = useState<() => void | null>(null);

  useEffect(() => {
    const unsubscribe = PostRepository.getPosts(
      { targetType, limit, targetId, feedType, dataTypes },
      ({ error, loading, data, hasNextPage, onNextPage }) => {
        setLoading(loading);
        if (error) return;
        if (!loading) {
          setItems(data);
          setOnNextPage(() => {
            if (hasNextPage) return onNextPage;
            return null;
          });
        }
      }
    );
    return unsubscribe;
  }, [targetType, targetId, limit, feedType, dataTypes]);

  return { posts: items, onNextPage, loading };
};
