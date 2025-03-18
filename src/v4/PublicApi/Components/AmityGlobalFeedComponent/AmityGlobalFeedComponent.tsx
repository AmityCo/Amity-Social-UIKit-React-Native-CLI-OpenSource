import React, { FC, memo, useCallback, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { useStyle } from './styles';
import { useDispatch, useSelector } from 'react-redux';
import globalFeedSlice from '../../../../redux/slices/globalfeedSlice';
import { RootState } from '../../../../redux/store';
import { RefreshControl } from 'react-native';
import AmityPostContentComponent, {
  IPost,
} from '../AmityPostContentComponent/AmityPostContentComponent';
import { ComponentID, PageID } from '../../../enum/enumUIKitID';
import { useAmityComponent } from '../../../hook/useUiKitReference';
import { AmityPostContentComponentStyleEnum } from '../../../enum/AmityPostContentComponentStyle';
import AmityStoryTabComponent from '../AmityStoryTabComponent/AmityStoryTabComponent';
import { AmityStoryTabComponentEnum } from '../../types';
import { usePostImpression } from '../../../../v4/hook/usePostImpression';
import {
  isAmityAd,
  useCustomRankingGlobalFeed,
} from '../../../../v4/hook/useCustomRankingGlobalFeed';
import PostAdComponent from '../../../component/PostAdComponent/PostAdComponent';
import { usePaginatorApi } from '../../../hook/usePaginator';

type AmityGlobalFeedComponentType = {
  pageId?: PageID;
};

export const globalFeedPageLimit = 10;

const AmityGlobalFeedComponent: FC<AmityGlobalFeedComponentType> = ({
  pageId,
}) => {
  const { nextPage, refresh } = useCustomRankingGlobalFeed();
  const componentId = ComponentID.global_feed_component;
  const { isExcluded, themeStyles, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });

  const { postList } = useSelector(
    (state: RootState) => state.globalFeed as { postList: (IPost | Amity.Ad)[] }
  );

  const { itemWithAds } = usePaginatorApi<IPost | Amity.Ad>({
    items: postList as (IPost | Amity.Ad)[],
    placement: 'feed' as Amity.AdPlacement,
    pageSize: globalFeedPageLimit,
    getItemId: (item) => (item as IPost).postId.toString(),
  });

  const [refreshing, setRefreshing] = useState(false);
  const { clearFeed } = globalFeedSlice.actions;
  const dispatch = useDispatch();
  const styles = useStyle(themeStyles);

  const flatListRef = useRef(null);

  const handleLoadMore = () => {
    nextPage();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    dispatch(clearFeed());
    await refresh();
    setRefreshing(false);
  }, [clearFeed, dispatch, refresh]);

  const { handleViewChange } = usePostImpression(
    postList.filter((item: IPost) => item.postId) as IPost[]
  );

  if (isExcluded) return null;

  return (
    <FlatList
      initialNumToRender={20}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={styles.feedWrap}
      data={itemWithAds}
      renderItem={({ item }) => {
        if (isAmityAd(item)) return <PostAdComponent ad={item as Amity.Ad} />;

        return (
          <AmityPostContentComponent
            post={item as IPost}
            AmityPostContentComponentStyle={
              AmityPostContentComponentStyleEnum.feed
            }
          />
        );
      }}
      keyExtractor={(item, index) =>
        isAmityAd(item) ? item.adId.toString() + index : item.postId.toString()
      }
      onEndReachedThreshold={0.5}
      onEndReached={handleLoadMore}
      ref={flatListRef}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['lightblue']}
          tintColor="lightblue"
        />
      }
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        !refreshing && (
          <AmityStoryTabComponent
            type={AmityStoryTabComponentEnum.globalFeed}
          />
        )
      }
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
      onViewableItemsChanged={handleViewChange}
      extraData={postList}
    />
  );
};

export default memo(AmityGlobalFeedComponent);
