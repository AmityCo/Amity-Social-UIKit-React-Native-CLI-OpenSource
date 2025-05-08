import { useEffect, useRef, useState } from 'react';
import { CategoryRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../hooks/useAuth';

export const useCategories = ({
  limit = 5,
}: {
  limit?: number;
} = {}) => {
  const { isConnected } = useAuth();
  const [categories, setCategories] = useState<Amity.Category[]>();
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [onNextCategoryPage, setOnNextCategoryPage] =
    useState<() => void | null>(null);

  const unsubscribersRef = useRef<(() => void)[]>([]);

  const fetchCategories = () => {
    setLoading(true);
    return CategoryRepository.getCategories(
      { limit },
      ({ error, loading, data, hasNextPage, onNextPage }) => {
        if (error) setError(error);
        if (!loading) {
          setLoading(loading);
          setCategories(data);
          setHasMore(hasNextPage);
          setOnNextCategoryPage(() => {
            if (hasNextPage) return onNextPage;
            return null;
          });
        }
      }
    );
  };

  const unsubscribeListener = () => {
    unsubscribersRef.current.forEach((unsubscriber) => unsubscriber());
    unsubscribersRef.current = [];
  };

  const refresh = () => {
    unsubscribeListener();
    setError(null);
    const unsubscribe = fetchCategories();
    unsubscribersRef.current.push(unsubscribe);
  };

  useEffect(() => {
    if (!isConnected) return () => {};

    const unsubscribe = fetchCategories();
    unsubscribersRef.current.push(unsubscribe);

    return () => unsubscribeListener();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return { refresh, categories, hasMore, onNextCategoryPage, loading, error };
};
