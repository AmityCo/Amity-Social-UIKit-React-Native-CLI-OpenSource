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
  // Kept in state (not just the ref) so that when the SDK callback provides the
  // next-page function, the consumer re-renders and receives it. A ref alone
  // never triggers a re-render, so the list's `onNextPage` stayed null and
  // pagination never fired.
  const [onNextPageFn, setOnNextPageFn] = useState<(() => void) | null>(null);
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

  const hasInitialDataRef = useRef(false);

  const fetchCustomRanking = useCallback(() => {
    if (!isConnected) return null;

    hasInitialDataRef.current = false;

    return FeedRepository.getGlobalFeed(
      { limit: globalFeedPageLimit },
      ({ data, loading: isLoading, error: $error, onNextPage }) => {
        if (isLoading) {
          // Only show loading state on initial fetch, not on pagination
          if (!hasInitialDataRef.current) {
            setFetching(true);
          }
          return;
        }

        if (onNextPage) {
          onNextPageRef.current = onNextPage;
          // Store as state too so the consumer re-renders with the fresh
          // paginator. Wrap in a thunk so setState doesn't invoke it.
          setOnNextPageFn(() => onNextPage);
        }
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
              hasInitialDataRef.current = true;
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
    setOnNextPageFn(null);
    hasInitialDataRef.current = false;

    unsubscribeRef.current = fetchCustomRanking();
  }, [fetchCustomRanking]);

  return {
    loading: fetching,
    refresh,
    itemWithAds,
    onNextPage: onNextPageFn,
    error,
    globalFeedPosts: postList,
  };
};
