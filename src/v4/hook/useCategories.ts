import { useEffect, useState } from 'react';
import { CategoryRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../hooks/useAuth';

export const useCategories = () => {
  const { isConnected } = useAuth();
  const [categories, setCategories] = useState<Amity.Category[]>();
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [onNextCategoryPage, setOnNextCategoryPage] =
    useState<() => void | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = CategoryRepository.getCategories(
      { limit: 5 },
      ({ error, loading, data, hasNextPage, onNextPage }) => {
        setLoading(loading);
        if (error) return;
        if (!loading) {
          setCategories(data);
          setHasMore(hasNextPage);
          setOnNextCategoryPage(() => {
            if (hasNextPage) return onNextPage;
            return null;
          });
        }
      }
    );
    return () => {
      console.log('unsubscribe');
      unsubscribe();
    };
  }, [isConnected]);
  return { categories, hasMore, onNextCategoryPage, loading };
};
