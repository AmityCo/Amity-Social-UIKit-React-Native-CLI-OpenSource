import { useEffect, useState } from 'react';
import { CategoryRepository } from '@amityco/ts-sdk-react-native';

export const useCategories = () => {
  const [categories, setCategories] = useState<Amity.Category[]>();
  const [hasMore, setHasMore] = useState(false);
  const [onNextCategoryPage, setOnNextCategoryPage] =
    useState<() => void | null>(null);
  useEffect(() => {
    const unsubscribe = CategoryRepository.getCategories(
      { limit: 5 },
      ({ error, loading, data, hasNextPage, onNextPage }) => {
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
    return unsubscribe;
  }, []);
  return { categories, hasMore, onNextCategoryPage };
};
