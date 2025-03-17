import { FeedRepository, PostRepository } from '@amityco/ts-sdk-react-native';
import { useCallback, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { amityPostsFormatter } from '../../util/postDataFormatter';
import globalFeedSlice from '../../redux/slices/globalfeedSlice';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { globalFeedPageLimit } from '../../v4/PublicApi/Components/AmityGlobalFeedComponent/AmityGlobalFeedComponent';

export const isAmityAd = (item: Amity.Post | Amity.Ad): item is Amity.Ad => {
  return (item as Amity.Ad)?.adId !== undefined;
};

export const useCustomRankingGlobalFeed = () => {
  const dispatch = useDispatch();

  const { isConnected } = useAuth();
  const { updateGlobalFeed } = globalFeedSlice.actions;

  const [paging, setPaging] = useState<{
    next?: string;
    previous?: string;
  } | null>(null);

  const [fetching, setFetching] = useState(false);

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

    dispatch(updateGlobalFeed(formattedPostList));
  };

  const fetch = async ({
    queryToken,
    limit = 10,
  }: {
    queryToken?: string;
    limit?: number;
  }) => {
    const {
      data,
      paging: { next, previous },
    } = await FeedRepository.getCustomRankingGlobalFeed({
      queryToken,
      limit,
    });

    if (data) {
      setFetching(false);
      setPaging({ next, previous });
      await processPosts(data);
    }
  };

  const nextPage = () => {
    setFetching(true);
    if (paging?.next) fetch({ queryToken: paging.next });
  };

  const previousPage = () => {
    setFetching(true);
    if (paging?.previous) fetch({ queryToken: paging.previous });
  };

  const refresh = async () => {
    setFetching(true);
    dispatch(updateGlobalFeed([]));
    await fetch({ limit: globalFeedPageLimit });
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      if (isConnected) fetch({ limit: globalFeedPageLimit });
    }, [isConnected])
  );

  return { loading: fetching, nextPage, previousPage, refresh };
};
