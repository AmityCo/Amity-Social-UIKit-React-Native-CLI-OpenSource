import { FeedRepository, PostRepository } from '@amityco/ts-sdk-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import globalFeedSlice from '../../redux/slices/globalfeedSlice';
import { globalFeedPageLimit } from '../../v4/PublicApi/Components/AmityGlobalFeedComponent/AmityGlobalFeedComponent';
import {
  RootState,
  useUIKitDispatch,
  useUIKitSelector,
} from '../../redux/store';
import { usePaginatorApi } from '../../v4/hook/usePaginator';
import { IComment } from '../../components/Social/CommentList';
import useAuth from '../../hooks/useAuth';

export const isAmityAd = (
  item: Amity.Post<any> | Amity.Ad | IComment
): item is Amity.Ad => {
  return (item as Amity.Ad)?.adId !== undefined;
};

export const useCustomRankingGlobalFeed = () => {
  const { isConnected } = useAuth();
  const dispatch = useUIKitDispatch();
  const unsubscribeRef = useRef<() => void | null>(null);
  const onNextPageRef = useRef<() => void | null>(null);

  const { setNewGlobalFeed } = globalFeedSlice.actions;

  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(false);
  const postList = useUIKitSelector(
    (state: RootState) => state.globalFeed.postList
  );

  const { itemWithAds } = usePaginatorApi<Amity.Post | Amity.Ad>({
    items: postList as (Amity.Post | Amity.Ad)[],
    isLoading: fetching,
    placement: 'feed' as Amity.AdPlacement,
    pageSize: globalFeedPageLimit,
    getItemId: (item) => (item as Amity.Post).postId.toString(),
  });

  const processPosts = async (posts: Amity.Post[]) => {
    const results = await Promise.all(
      posts.map((post) => {
        if (post?.children.length > 0) {
          return new Promise((resolve) => {
            const unsubscribe = PostRepository.getPost(
              post?.children[0],
              ({ error, loading, data }) => {
                if (!error && !loading) {
                  if (
                    data?.dataType === 'image' ||
                    data?.dataType === 'video' ||
                    data?.dataType === 'liveStream' ||
                    data?.dataType === 'poll'
                  ) {
                    resolve(post);
                  } else {
                    resolve(null);
                  }
                } else {
                  resolve(null);
                }
              }
            );

            unsubscribe();
          });
        } else {
          return post;
        }
      })
    );

    return results.filter((result) => result !== null) as Amity.Post<any>[];
  };

  const fetchCustomRancking = useCallback(() => {
    if (!isConnected) return null;

    return FeedRepository.getCustomRankingGlobalFeed(
      { limit: globalFeedPageLimit },
      ({ data, loading, error: e, onNextPage }) => {
        setFetching(loading);

        if (!loading && data) {
          processPosts(data).then((posts) => dispatch(setNewGlobalFeed(posts)));
        }

        if (onNextPage) onNextPageRef.current = onNextPage;

        if (e) setError(e);
      }
    );
  }, [dispatch, setNewGlobalFeed, isConnected]);

  useEffect(() => {
    unsubscribeRef.current = fetchCustomRancking();

    return () => unsubscribeRef.current?.();
  }, [fetchCustomRancking]);

  const refresh = useCallback(() => {
    if (unsubscribeRef.current) unsubscribeRef.current?.();
    onNextPageRef.current = null;

    unsubscribeRef.current = fetchCustomRancking();
  }, [fetchCustomRancking]);

  return {
    loading: fetching,
    refresh,
    itemWithAds,
    onNextPage: onNextPageRef.current,
    error,
  };
};
