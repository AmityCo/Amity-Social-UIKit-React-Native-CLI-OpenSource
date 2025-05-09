import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FlatList } from 'react-native';
import { useSelector } from 'react-redux';
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
import useAuth from '../../../../hooks/useAuth';
import { useStyle } from './styles';
import {
  isAmityAd,
  useCustomRankingGlobalFeed,
} from '../../../hook/useCustomRankingGlobalFeed';
import PostAdComponent from '../../../component/PostAdComponent/PostAdComponent';
import Divider from '../../../component/Divider';

type AmityGlobalFeedComponentType = {
  pageId?: PageID;
};

export const globalFeedPageLimit = 20;

const AmityGlobalFeedComponent: FC<AmityGlobalFeedComponentType> = ({
  pageId,
}) => {
  const { fetch, itemWithAds, refresh, loading } = useCustomRankingGlobalFeed();
  const componentId = ComponentID.global_feed_component;
  const { isExcluded, themeStyles, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });

  const [refreshing, setRefreshing] = useState(false);
  const styles = useStyle();
  const { isConnected } = useAuth();
  const flatListRef = useRef(null);
  const nextPage = useSelector(
    (state: RootState) => state.globalFeed.paginationData.next
  );

  const handleLoadMore = () => {
    if (loading || !nextPage) return;

    fetch({
      queryToken: nextPage,
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const { handleViewChange } = usePostImpression(
    itemWithAds.filter((item: IPost | Amity.Ad) =>
      isAmityAd(item) ? item?.adId : item?.postId
    )
  );

  useEffect(() => {
    if (isConnected) {
      fetch({
        limit: globalFeedPageLimit,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  if (isExcluded) return null;

  return (
    <FlatList
      initialNumToRender={20}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={styles.feedWrap}
      data={itemWithAds}
      renderItem={({ item, index }) => {
        return (
          <>
            {index !== 0 && <Divider themeStyles={themeStyles} />}
            {isAmityAd(item) ? (
              <PostAdComponent ad={item as Amity.Ad} />
            ) : (
              <AmityPostContentComponent
                post={item as IPost}
                AmityPostContentComponentStyle={
                  AmityPostContentComponentStyleEnum.feed
                }
              />
            )}
          </>
        );
      }}
      keyExtractor={(item, index) =>
        (isAmityAd(item) ? item.adId.toString() : item.postId.toString()) +
        `_${index}`
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
        !refreshing &&
        !loading && (
          <AmityStoryTabComponent
            type={AmityStoryTabComponentEnum.globalFeed}
          />
        )
      }
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
      onViewableItemsChanged={handleViewChange}
      extraData={itemWithAds}
    />
  );
};

export default memo(AmityGlobalFeedComponent);
