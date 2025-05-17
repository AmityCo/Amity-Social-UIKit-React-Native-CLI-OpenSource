import React, { forwardRef, useImperativeHandle } from 'react';
import { ComponentID, PageID } from '../../../enum';
import { useAmityComponent, useCommunity } from '../../../hook';
// import { useStyles } from './styles';
import AmityPostContentComponent from '../AmityPostContentComponent/AmityPostContentComponent';
import { usePosts } from '../../../hook/usePosts';
import Divider from '../../../component/Divider';
import { View, FlatList } from 'react-native';
import { isAmityAd } from '../../../hook/useCustomRankingGlobalFeed';
import PostAdComponent from '../../../component/PostAdComponent/PostAdComponent';
import { usePaginatorApi } from '../../../hook/usePaginator';
// import { usePostImpression } from '../../../hook/usePostImpression';
import { AmityPostContentComponentStyleEnum } from '../../../enum/AmityPostContentComponentStyle';
import EmptyComponent from '../../../component/EmptyComponent/EmptyComponent';
import { emptyPost, privateFeed } from '../../../assets/icons';

export interface AmityCommunityFeedRef {
  handleLoadMore: () => void;
}

import { useStyles } from './styles';

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

  // const { handleViewChange } = usePostImpression(
  //   itemWithAds?.filter(
  //     (item: Amity.Post | Amity.Ad) =>
  //       !!(isAmityAd(item) ? item?.adId : item?.postId)
  //   ) as (Amity.Post | Amity.Ad)[]
  // );

  const handleLoadMore = () => {
    if (onNextPage) {
      onNextPage();
    }
  };

  useImperativeHandle(ref, () => ({
    handleLoadMore,
  }));

  if (!posts) return null;

  if (!community?.isJoined && !community?.isPublic) {
    return (
      <View style={styles.listContainer}>
        <EmptyComponent
          title="You need to join this community to see the posts"
          icon={emptyPost}
          themeStyle={themeStyles}
        />
      </View>
    );
  }

  if (!loading && itemWithAds?.length === 0) {
    return (
      <View style={styles.listContainer}>
        <EmptyComponent
          title="No posts yet"
          icon={privateFeed}
          themeStyle={themeStyles}
        />
      </View>
    );
  }

  return (
    <FlatList
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
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
                AmityPostContentComponentStyle={
                  AmityPostContentComponentStyleEnum.feed
                }
              />
            )}
          </View>
        );
      }}
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
      // onViewableItemsChanged={handleViewChange}
      keyExtractor={(item, index) =>
        isAmityAd(item)
          ? item.adId.toString() + index
          : item.postId.toString() + '_' + index
      }
    />
  );
});

export default AmityCommunityFeedComponent;
