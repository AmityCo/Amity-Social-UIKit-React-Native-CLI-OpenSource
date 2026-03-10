import { useStyles } from './styles';
import { forwardRef, useImperativeHandle } from 'react';
import { ComponentID, PageID } from '../../../../enums';
import { useAmityComponent, useCommunity } from '../../../../hooks';
import AmityPostContentComponent from '../../../../features/post/components/Content/Content';
import { usePosts } from '../../../../hooks/usePosts';
import Divider from '../../../../components/Divider';
import { View, FlatList } from 'react-native';
import { isAmityAd } from '../../../../hooks/useCustomRankingGlobalFeed';
import PostAdComponent from '../../../../components/PostAdComponent/PostAdComponent';
import { usePaginatorApi } from '../../../../hooks/usePaginator';
import { usePostImpression } from '../../../../hooks/usePostImpression';
import {
  AmityPostCategory,
  AmityPostContentComponentStyleEnum,
} from '../../../../enums/AmityPostContentComponentStyle';
import { Empty } from '../../../../components';
import PostFeedSkeleton from '../../../../components/PostFeedSkeleton';
import { usePinnedPostCollection } from '../../../../hooks/collections/post/usePinnedPostCollection';
import { isPinnedPost } from '../../../../utils';

export interface AmityCommunityFeedRef {
  handleLoadMore: () => void;
}

type AmityCommunityFeedComponentProps = {
  pageId?: PageID;
  communityId: string;
};

const pageLimit = 10;

const AmityCommunityFeedComponent = forwardRef<
  AmityCommunityFeedRef,
  AmityCommunityFeedComponentProps
>(({ pageId = PageID.WildCardPage, communityId }, ref) => {
  const componentId = ComponentID.community_feed;
  const { community } = useCommunity(communityId);
  const { accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });

  const { posts, loading, onNextPage } = usePosts({
    targetId: communityId,
    targetType: 'community',
    limit: pageLimit,
  });

  const pinnedPostCollection = usePinnedPostCollection({
    enabled: !!communityId,
    params: {
      communityId,
      sortBy: 'lastPinned',
    },
  });

  const announcementPosts =
    pinnedPostCollection?.data?.filter(
      (item) => item?.placement === 'announcement' && item?.post
    ) || [];

  const pinnedPosts =
    pinnedPostCollection?.data?.filter(
      (item) =>
        item?.placement === 'default' &&
        item?.post &&
        !announcementPosts
          .map((aItem) => aItem?.post?.postId)
          .includes(item?.post?.postId)
    ) || [];

  const { itemWithAds } = usePaginatorApi<Amity.Post | Amity.Ad>({
    items: posts as Amity.Post[],
    isLoading: loading,
    placement: 'feed' as Amity.AdPlacement,
    communityId: communityId,
    pageSize: pageLimit,
    getItemId: (item) =>
      isAmityAd(item) ? item?.adId.toString() : item?.postId.toString(),
  });

  const styles = useStyles();

  const { handleViewChange } = usePostImpression(
    itemWithAds?.filter(
      (item: Amity.Post | Amity.Ad) =>
        !!(isAmityAd(item) ? item?.adId : item?.postId)
    ) as (Amity.Post | Amity.Ad)[]
  );

  const handleLoadMore = () => {
    if (onNextPage) {
      onNextPage();
    }
  };

  useImperativeHandle(ref, () => ({
    handleLoadMore,
  }));

  if (!community?.isJoined && !community?.isPublic) {
    return (
      <Empty heightPercent={0.3}>
        <Empty.Content
          title="This community is private"
          description="Join this community to see its content and members."
          icon="private"
        />
      </Empty>
    );
  }

  if (loading && !itemWithAds) {
    return <PostFeedSkeleton />;
  }

  if (!loading && itemWithAds?.length === 0) {
    return (
      <Empty heightPercent={0.3}>
        <Empty.Content title="No posts yet" icon="post" />
      </Empty>
    );
  }

  const postsWithoutAnnouncement =
    itemWithAds?.filter(
      (post) =>
        post &&
        !announcementPosts.some(
          (announcementPost) =>
            !isAmityAd(post) && announcementPost?.post?.postId === post?.postId
        )
    ) || [];

  const postsWithPinnedPosts = postsWithoutAnnouncement?.map((post) => {
    const pinnedPost = pinnedPosts?.find(
      (pinned) => !isAmityAd(post) && pinned?.post?.postId === post?.postId
    );
    return pinnedPost ? pinnedPost : post;
  });

  const isAnnouncementPostPinned = pinnedPostCollection?.data?.some(
    (item) =>
      item?.placement === 'default' &&
      item?.post &&
      announcementPosts
        .map((aItem) => aItem?.post?.postId)
        .includes(item?.post?.postId)
  );

  return (
    <FlatList
      scrollEnabled={false}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      contentContainerStyle={styles.container}
      data={[
        ...announcementPosts,
        ...(postsWithPinnedPosts ? postsWithPinnedPosts : []),
      ]}
      renderItem={({ item, index }) => {
        return (
          <View>
            {index !== 0 && <Divider />}
            {isPinnedPost(item) ? (
              <AmityPostContentComponent
                post={item.post}
                category={
                  item.placement === 'announcement'
                    ? isAnnouncementPostPinned
                      ? AmityPostCategory.PIN_AND_ANNOUNCEMENT
                      : AmityPostCategory.ANNOUNCEMENT
                    : AmityPostCategory.PIN
                }
                isCommunityNameShown={false}
                AmityPostContentComponentStyle={
                  AmityPostContentComponentStyleEnum.feed
                }
              />
            ) : isAmityAd(item) ? (
              <PostAdComponent ad={item as Amity.Ad} />
            ) : (
              <AmityPostContentComponent
                post={item}
                isCommunityNameShown={false}
                AmityPostContentComponentStyle={
                  AmityPostContentComponentStyleEnum.feed
                }
              />
            )}
          </View>
        );
      }}
      ListFooterComponent={
        loading && itemWithAds && itemWithAds.length > 0 ? (
          <PostFeedSkeleton />
        ) : null
      }
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
      onViewableItemsChanged={handleViewChange}
      keyExtractor={(item, index) =>
        isPinnedPost(item)
          ? item.post.postId
          : isAmityAd(item)
          ? item.adId.toString() + index
          : item.postId.toString() + '_' + index
      }
      extraData={itemWithAds}
    />
  );
});

export default AmityCommunityFeedComponent;
