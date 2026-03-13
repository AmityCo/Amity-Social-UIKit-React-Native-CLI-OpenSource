import {
  FeedRepository,
  PostStructureType,
} from '@amityco/ts-sdk-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';
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

type UseCustomRankingGlobalFeed = {
  enabled: boolean;
};

export const useCustomRankingGlobalFeed = ({
  enabled = true,
}: UseCustomRankingGlobalFeed) => {
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
    if (!isConnected || !enabled) return null;

    return FeedRepository.getCustomRankingGlobalFeed(
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
          interactionHandleRef.current =
            InteractionManager.runAfterInteractions(() => {
              dispatch(setNewGlobalFeed(filtered));
              setFetching(false);
            });
        } else {
          setFetching(false);
        }
      }
    );
  }, [dispatch, setNewGlobalFeed, isConnected, enabled]);

  useEffect(() => {
    unsubscribeRef.current = fetchCustomRanking();

    return () => {
      unsubscribeRef.current?.();
      interactionHandleRef.current?.cancel();
    };
  }, [fetchCustomRanking]);

  const refresh = useCallback(() => {
    if (unsubscribeRef.current) unsubscribeRef.current?.();
    interactionHandleRef.current?.cancel();
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
