import { useCallback, useState } from 'react';
import { PostRepository } from '@amityco/ts-sdk-react-native';
import { useFocusEffect } from '@react-navigation/native';

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

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = PostRepository.getPosts(
        { targetType, limit, targetId, feedType, dataTypes },
        ({
          error,
          loading: isLoading,
          data,
          hasNextPage,
          onNextPage: loadNextPage,
        }) => {
          if (error) return;
          if (!isLoading) {
            setItems(data);
            setOnNextPage(() => {
              if (hasNextPage) return loadNextPage;
              return null;
            });
          }
          setLoading(isLoading);
        }
      );
      return unsubscribe;
    }, [targetType, targetId, limit, feedType, dataTypes])
  );

  return { posts: items, onNextPage, loading };
};
