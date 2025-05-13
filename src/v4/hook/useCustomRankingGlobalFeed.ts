import { FeedRepository, PostRepository } from '@amityco/ts-sdk-react-native';
import { useState } from 'react';
import { amityPostsFormatter } from '../../util/postDataFormatter';
import globalFeedSlice from '../../redux/slices/globalfeedSlice';
import { useDispatch, useSelector } from 'react-redux';
import { globalFeedPageLimit } from '../../v4/PublicApi/Components/AmityGlobalFeedComponent/AmityGlobalFeedComponent';
import { RootState } from '../../redux/store';
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

  const { itemWithAds, reset } = usePaginatorApi<Amity.Post | Amity.Ad>({
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
                    data?.dataType === 'video'
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

    const filteredResult = results.filter((result) => result !== null);
    const formattedPostList = await amityPostsFormatter(filteredResult);

    return formattedPostList;
  };

  const fetch = async ({
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
  };

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
