import { FeedRepository } from '@amityco/ts-sdk-react-native';
import { useCallback, useState } from 'react';
import globalFeedSlice from '../../redux/slices/globalfeedSlice';
import { useDispatch, useSelector } from 'react-redux';
import { globalFeedPageLimit } from '../../v4/PublicApi/Components/AmityGlobalFeedComponent/AmityGlobalFeedComponent';
import { RootState } from '../../redux/store';
import { IPost } from '../../v4/PublicApi/Components/AmityPostContentComponent/AmityPostContentComponent';
import { usePaginatorApi } from '../../v4/hook/usePaginator';

export const isAmityAd = (item: Amity.Post | Amity.Ad): item is Amity.Ad => {
  return (item as Amity.Ad)?.adId !== undefined;
};

export const useCustomRankingGlobalFeed = () => {
  const dispatch = useDispatch();

  const { updateGlobalFeed, setPaginationData, setNewGlobalFeed } =
    globalFeedSlice.actions;

  const [fetching, setFetching] = useState(false);
  const postList = useSelector((state: RootState) => state.globalFeed.postList);

  const { itemWithAds, reset } = usePaginatorApi<IPost | Amity.Ad>({
    items: postList as (IPost | Amity.Ad)[],
    isLoading: fetching,
    placement: 'feed' as Amity.AdPlacement,
    pageSize: globalFeedPageLimit,
    getItemId: (item) => (item as IPost).postId.toString(),
  });

  const processPosts = async (posts: Amity.Post[]) => {
    return posts.filter((post) => {
      if (post?.children.length > 0) {
        const isImageOrVideo =
          post?.children[0].dataType === 'image' ||
          post?.children[0].dataType === 'video';
        return isImageOrVideo;
      }
      return true;
    });
  };

  const fetch = useCallback(
    async ({
      queryToken,
      limit = 10,
    }: {
      queryToken?: string;
      limit?: number;
    } = {}) => {
      // if load first page, reset all the running index in paginator
      setFetching(true);
      if (!queryToken) reset();
      const {
        data,
        paging: { next, previous },
      } = await FeedRepository.getCustomRankingGlobalFeed({
        queryToken,
        limit,
      });

      if (data) {
        dispatch(setPaginationData({ next, previous }));
        const processedPosts = await processPosts(data);
        if (!queryToken) {
          dispatch(setNewGlobalFeed(processedPosts));
        } else {
          dispatch(updateGlobalFeed(processedPosts));
        }

        setFetching(false);
      }
    },
    [
      dispatch,
      reset,
      setFetching,
      setNewGlobalFeed,
      updateGlobalFeed,
      setPaginationData,
    ]
  );

  const refresh = async () => {
    // dispatch(clearFeed());
    await fetch({ limit: globalFeedPageLimit });
    return true;
  };

  return {
    fetch,
    loading: fetching,
    refresh,
    itemWithAds,
  };
};
