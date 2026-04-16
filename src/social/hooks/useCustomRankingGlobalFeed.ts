import {
  FeedRepository,
  PostStructureType,
} from '@amityco/ts-sdk-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import globalFeedSlice from '../../core/stores/slices/globalfeedSlice';
import { globalFeedPageLimit } from '../features/feed/components/GlobalFeed/GlobalFeed';
import { InteractionManager } from 'react-native';
import {
  RootState,
  useUIKitDispatch,
  useUIKitSelector,
} from '../../core/stores/store';
import { usePaginatorApi } from './usePaginator';
import { IComment } from '../components/legacy/Social/CommentList';
import useAuth from '../../core/hooks/useAuth';

export const isAmityAd = (
  item: Amity.Post<any> | Amity.Ad | IComment
): item is Amity.Ad => {
  return (item as Amity.Ad)?.adId !== undefined;
};

type UseCustomRankingGlobalFeed = {
  enabled?: boolean;
};

export const useCustomRankingGlobalFeed = ({
  enabled = true,
}: UseCustomRankingGlobalFeed = {}) => {
  const { isConnected } = useAuth();
  const dispatch = useUIKitDispatch();
  const unsubscribeRef = useRef<() => void | null>(null);
  const onNextPageRef = useRef<() => void | null>(null);
  const interactionHandleRef = useRef<{ cancel: () => void } | null>(null);

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

  const fetchCustomRanking = useCallback(() => {
    if (!isConnected) return null;

    return FeedRepository.getGlobalFeed(
      { limit: globalFeedPageLimit },
      ({ data, loading: isLoading, error: $error, onNextPage }) => {
        if (isLoading) {
          setFetching(true);
          return;
        }

        if (onNextPage) onNextPageRef.current = onNextPage;
        if ($error) setError($error);

        if (data) {
          const filtered = data.filter(
            (post) =>
              post.structureType !== PostStructureType.AUDIO &&
              post.structureType !== PostStructureType.FILE &&
              post.structureType !== PostStructureType.MIXED
          );
          interactionHandleRef.current?.cancel();
          interactionHandleRef.current =
            InteractionManager.runAfterInteractions(() => {
              dispatch(setNewGlobalFeed(filtered));
              setFetching(false);
              interactionHandleRef.current = null;
            });
        } else {
          setFetching(false);
        }
      }
    );
  }, [dispatch, setNewGlobalFeed, isConnected]);

  useEffect(() => {
    if (!enabled) return undefined;

    unsubscribeRef.current = fetchCustomRanking();

    return () => {
      unsubscribeRef.current?.();
      interactionHandleRef.current?.cancel();
      interactionHandleRef.current = null;
    };
  }, [fetchCustomRanking, enabled]);

  const refresh = useCallback(() => {
    if (unsubscribeRef.current) unsubscribeRef.current?.();
    interactionHandleRef.current?.cancel();
    interactionHandleRef.current = null;
    onNextPageRef.current = null;

    unsubscribeRef.current = fetchCustomRanking();
  }, [fetchCustomRanking]);

  return {
    loading: fetching,
    refresh,
    itemWithAds,
    onNextPage: onNextPageRef.current,
    error,
    globalFeedPosts: postList,
  };
};
