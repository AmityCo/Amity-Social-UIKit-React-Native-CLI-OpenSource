import React, { FC, memo, useCallback, useMemo, useRef, useState } from 'react';
import { FlatList } from 'react-native';

import { RefreshControl } from 'react-native';
import AmityPostContentComponent from '../../../post/components/Content/Content';
import { ComponentID, PageID } from '../../../../enums/enumUIKitID';
import { useAmityComponent } from '../../../../hooks/useUiKitReference';
import { AmityPostContentComponentStyleEnum } from '../../../../enums/AmityPostContentComponentStyle';
import { usePostImpression } from '../../../../hooks/usePostImpression';
import { useStyle } from './styles';
import { isAmityAd } from '../../../../hooks/useCustomRankingGlobalFeed';
import PostAdComponent from '../../../../components/PostAdComponent/PostAdComponent';
import Divider from '../../../../components/Divider';

type AmityGlobalFeedComponentType = {
  pageId?: PageID;
  GlobalFeedHeaderComponent?: React.ReactElement;
  itemWithAds: (Amity.Post | Amity.Ad)[] | undefined;
  refresh: () => void;
  loading: boolean;
  onNextPage: (() => void) | null;
};

export const globalFeedPageLimit = 20;

const AmityGlobalFeedComponent: FC<AmityGlobalFeedComponentType> = ({
  pageId,
  GlobalFeedHeaderComponent,
  itemWithAds,
  refresh,
  loading,
  onNextPage,
}) => {
  const componentId = ComponentID.global_feed_component;
  const { isExcluded, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });

  const [refreshing, setRefreshing] = useState(false);
  const styles = useStyle();
  const flatListRef = useRef(null);

  const handleLoadMore = () => {
    if (loading || !onNextPage) return;
    onNextPage?.();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const { handleViewChange } = usePostImpression(
    itemWithAds?.filter((item: Amity.Post | Amity.Ad) =>
      isAmityAd(item) ? item?.adId : item?.postId
    )
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;

  const listHeaderComponent = useMemo(() => {
    return GlobalFeedHeaderComponent || null;
  }, [GlobalFeedHeaderComponent]);

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
            {index !== 0 && <Divider />}
            {isAmityAd(item) ? (
              <PostAdComponent ad={item as Amity.Ad} />
            ) : (
              <AmityPostContentComponent
                post={item as Amity.Post}
                AmityPostContentComponentStyle={
                  AmityPostContentComponentStyleEnum.feed
                }
              />
            )}
          </>
        );
      }}
      keyExtractor={(item, index) =>
        isAmityAd(item)
          ? item.adId.toString() + '_' + index
          : item.postId.toString() + '_' + index
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
      ListHeaderComponent={listHeaderComponent}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={handleViewChange}
      extraData={itemWithAds}
    />
  );
};

export default memo(AmityGlobalFeedComponent);
