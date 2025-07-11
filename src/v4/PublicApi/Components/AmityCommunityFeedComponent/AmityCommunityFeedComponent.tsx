import { useStyles } from './styles';
import React, { forwardRef, useImperativeHandle } from 'react';
import { ComponentID, PageID } from '../../../enum';
import { useAmityComponent, useCommunity } from '../../../hook';
import AmityPostContentComponent from '../AmityPostContentComponent/AmityPostContentComponent';
import { usePosts } from '../../../hook/usePosts';
import Divider from '../../../component/Divider';
import { View, FlatList } from 'react-native';
import { isAmityAd } from '../../../hook/useCustomRankingGlobalFeed';
import PostAdComponent from '../../../component/PostAdComponent/PostAdComponent';
import { usePaginatorApi } from '../../../hook/usePaginator';
import { usePostImpression } from '../../../hook/usePostImpression';
import { AmityPostContentComponentStyleEnum } from '../../../enum/AmityPostContentComponentStyle';
import EmptyComponent from '../../../component/EmptyComponent/EmptyComponent';
import { emptyPost, privateFeed } from '../../../assets/icons';
import CommunityFeedSkeleton from '../../../component/CommunityFeedSkeleton/CommunityFeedSkeleton';

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
  const { accessibilityId, themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });

  const { posts, loading, onNextPage } = usePosts({
    targetId: communityId,
    targetType: 'community',
    limit: pageLimit,
  });

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
      <View style={styles.listContainer}>
        <EmptyComponent
          title="This community is private"
          description="Join this community to see its content and members."
          icon={privateFeed}
          themeStyle={themeStyles}
        />
      </View>
    );
  }

  if (loading && !itemWithAds) {
    return <CommunityFeedSkeleton themeStyles={themeStyles} />;
  }

  if (!loading && itemWithAds?.length === 0) {
    return (
      <View style={styles.listContainer}>
        <EmptyComponent
          title="No posts yet"
          icon={emptyPost}
          themeStyle={themeStyles}
        />
      </View>
    );
  }

  return (
    <FlatList
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      contentContainerStyle={styles.container}
      data={itemWithAds}
      scrollEnabled={false}
      renderItem={({ item, index }) => {
        return (
          <View>
            {index !== 0 && <Divider themeStyles={themeStyles} />}
            {isAmityAd(item) ? (
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
          <CommunityFeedSkeleton themeStyles={themeStyles} />
        ) : null
      }
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
      onViewableItemsChanged={handleViewChange}
      keyExtractor={(item, index) =>
        isAmityAd(item)
          ? item.adId.toString() + index
          : item.postId.toString() + '_' + index
      }
      extraData={itemWithAds}
    />
  );
});

export default AmityCommunityFeedComponent;
