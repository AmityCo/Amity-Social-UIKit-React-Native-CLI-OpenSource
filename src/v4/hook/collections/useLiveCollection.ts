import {
  InfiniteData,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

type UseLiveCollection<Param, Data> = {
  key: string[];
  enabled?: boolean;
  params: Amity.LiveCollectionParams<Param>;
  fetcher: (
    params: Amity.LiveCollectionParams<Param>,
    callback: Amity.LiveCollectionCallback<Data>,
    config?: Amity.LiveCollectionConfig
  ) => Amity.Unsubscriber;
};

type NextPageParam = () => void;

type CollectionResponse<Data> = {
  data: Data[];
  hasNextPage: boolean;
  onNextPage?: NextPageParam;
};

type PromiseParameter<Data> = Parameters<
  ConstructorParameters<typeof Promise<Data>>[0]
>;

type PromiseResolve<Data> = PromiseParameter<Data>[0];

type PromiseReject<Data> = PromiseParameter<Data>[1];

export const useLiveCollection = <Param, Data>({
  key,
  enabled,
  params,
  fetcher,
}: UseLiveCollection<Param, Data>) => {
  const unsubscribe = useRef<Amity.Unsubscriber | null>(null);
  const resolveRef = useRef<PromiseResolve<CollectionResponse<Data>> | null>(
    null
  );
  const rejectRef = useRef<PromiseReject<CollectionResponse<Data>> | null>(
    null
  );
  const queryClient = useQueryClient();

  const fetch = async ({
    pageParam,
  }: {
    pageParam?: NextPageParam;
  }): Promise<CollectionResponse<Data>> => {
    return new Promise((resolve, reject) => {
      resolveRef.current = resolve;
      rejectRef.current = reject;

      if (pageParam) {
        pageParam();
      } else {
        unsubscribe.current = fetcher(
          params,
          ({ error, loading, data: $data, hasNextPage, onNextPage }) => {
            if (error) return rejectRef.current?.(error);
            if (!loading) {
              resolveRef.current?.({ data: $data, hasNextPage, onNextPage });
              queryClient.setQueryData(
                [key],
                (
                  oldData:
                    | InfiniteData<CollectionResponse<Data>, NextPageParam>
                    | undefined
                ) => {
                  const newPage = { data: $data, hasNextPage, onNextPage };
                  if (!oldData) {
                    return {
                      pages: [newPage],
                      pageParams: [undefined],
                    };
                  }

                  return {
                    pages: [...oldData.pages, newPage],
                    pageParams: [...oldData.pageParams, onNextPage],
                  };
                }
              );
            }
          }
        );
      }
    });
  };

  const query = useInfiniteQuery({
    initialPageParam: undefined,
    queryKey: [key],
    queryFn: fetch,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.onNextPage : undefined;
    },
    select: (data) => {
      return {
        pages: data.pages.slice(-1),
        pageParams: data.pageParams.slice(-1),
      };
    },
    enabled,
  });

  const data = query.data?.pages?.flatMap((page) => page.data) ?? [];

  useEffect(() => {
    queryClient.setQueryData(
      key,
      (cache: InfiniteData<CollectionResponse<Data>, NextPageParam>) => {
        return {
          pages: cache ? cache.pages.slice(-1) : [],
          pageParams: cache ? cache.pageParams.slice(-1) : [],
        };
      }
    );
  }, [data.length, queryClient, key]);

  useEffect(() => {
    return () => unsubscribe.current?.();
  }, []);

  return { ...query, data };
};
