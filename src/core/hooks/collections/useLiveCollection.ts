import { useCallback, useEffect, useRef, useState } from 'react';

export function useLiveCollection<TCallback, TParams = void>({
  fetcher,
  params,
  callback = () => {},
  enabled = true,
}: {
  fetcher:
    | ((
        params: Amity.LiveCollectionParams<TParams>,
        callback: Amity.LiveCollectionCallback<TCallback>,
        config?: Amity.LiveCollectionConfig
      ) => Amity.Unsubscriber)
    | ((
        callback: Amity.LiveCollectionCallback<TCallback>,
        config?: Amity.LiveCollectionConfig
      ) => Amity.Unsubscriber);
  params?: Amity.LiveCollectionParams<TParams>;
  callback?: Amity.LiveCollectionCallback<TCallback>;
  enabled?: boolean;
}): {
  items: TCallback[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: Error | null;
  loadMoreHasBeenCalled: boolean;
  refresh: () => void;
  isLoadingFirstPage: boolean;
} {
  const [loadMoreHasBeenCalled, setLoadMoreHasBeenCalled] = useState(false);
  const loadingCountRef = useRef(0);
  const [isLoadingFirstPage, setIsLoadingFirstPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<TCallback[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreFnRef = useRef<(() => void) | null>(null);
  const unsubscribeRef = useRef<Amity.Unsubscriber | null>(null);

  const loadMore = useCallback(() => {
    if (loadMoreFnRef.current) {
      setLoadMoreHasBeenCalled(true);
      loadMoreFnRef.current?.();
    }
  }, [loadMoreFnRef]);

  const callbackFn = useCallback(
    (response: any) => {
      if (!enabled) return;
      if (response.data) setItems(response.data);
      if (loadingCountRef.current === 0) {
        setIsLoadingFirstPage(response.loading);
      } else {
        setIsLoadingFirstPage(false);
        setIsLoading(response.loading);
      }
      loadingCountRef.current += 1;
      setHasMore(response.hasNextPage);
      setError(response.error);
      loadMoreFnRef.current = response.onNextPage;
      callback(response);
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const { unsubscribe } = subscribe({
      fetcher,
      params,
      callback: callbackFn,
    });
    unsubscribeRef.current = unsubscribe;

    return () => unsubscribe();
  }, [JSON.stringify(params), enabled]);

  const refresh = useCallback(() => {
    if (unsubscribeRef.current) unsubscribeRef.current();

    const { unsubscribe } = subscribe({
      fetcher,
      params,
      callback: callbackFn,
    });

    unsubscribeRef.current = unsubscribe;

    return () => unsubscribe();
  }, [fetcher, JSON.stringify(params)]);

  return {
    error,
    items,
    hasMore,
    isLoading,
    loadMore,
    refresh,
    isLoadingFirstPage,
    loadMoreHasBeenCalled,
  };
}

const subscribe = <TParams, TCallback>({
  fetcher,
  params,
  callback,
  config,
}: {
  fetcher:
    | ((
        params: Amity.LiveCollectionParams<TParams>,
        callback: Amity.LiveCollectionCallback<TCallback>,
        config?: Amity.LiveCollectionConfig
      ) => Amity.Unsubscriber)
    | ((
        callback: Amity.LiveCollectionCallback<TCallback>,
        config?: Amity.LiveCollectionConfig
      ) => Amity.Unsubscriber);
  params?: Amity.LiveCollectionParams<TParams>;
  callback: Amity.LiveCollectionCallback<TCallback>;
  config?: Amity.LiveCollectionConfig;
  refresh?: boolean;
}) => {
  // Check if fetcher accepts params (has 2-3 arguments) or only callback (has 1-2 arguments)
  const unsubscribe =
    params !== undefined
      ? (fetcher as any)(params, (response: any) => callback(response), config)
      : (fetcher as any)((response: any) => callback(response), config);
  return { unsubscribe };
};
