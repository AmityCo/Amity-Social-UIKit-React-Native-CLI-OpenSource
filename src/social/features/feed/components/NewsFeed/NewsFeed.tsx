import { FC, memo, useCallback } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ComponentID, PageID } from '../../../../enums/enumUIKitID';
import AmityGlobalFeedComponent from '../GlobalFeed/GlobalFeed';
import { useStyles } from './styles';
import { useAmityComponent } from '../../../../hooks';
import { useCustomRankingGlobalFeed } from '../../../../hooks/useCustomRankingGlobalFeed';
import NewsFeedLoadingComponent from '../../../../components/NewsFeedLoadingComponent/NewsFeedLoadingComponent';
import { AmityEmptyNewsFeedComponent } from '../../../..';
import uiSlice from '../../../../../core/stores/slices/uiSlice';
import { useUIKitDispatch } from '../../../../../core/stores/store';

type AmityNewsFeedComponentType = {
  pageId?: PageID;
  onPressExploreCommunity?: () => void;
};

const AmityNewsFeedComponent: FC<AmityNewsFeedComponentType> = ({
  pageId = PageID.WildCardPage,
  onPressExploreCommunity,
}) => {
  const styles = useStyles();
  const componentId = ComponentID.newsfeed_component;
  const { accessibilityId, isExcluded } = useAmityComponent({
    pageId,
    componentId,
  });

  const { itemWithAds, refresh, globalFeedPosts, loading, onNextPage } =
    useCustomRankingGlobalFeed();

  const dispatch = useUIKitDispatch();
  const { markFeedReloaded } = uiSlice.actions;

  // Coming back to the feed is a reload as far as the viewer is concerned, but
  // the screen is never unmounted, so nothing here re-runs on its own. Say so
  // explicitly, the same way pull-to-refresh does.
  useFocusEffect(
    useCallback(() => {
      dispatch(markFeedReloaded());
    }, [dispatch, markFeedReloaded])
  );

  if (isExcluded) return null;

  if (
    (loading && !globalFeedPosts?.length) ||
    (!itemWithAds && globalFeedPosts?.length)
  )
    return <NewsFeedLoadingComponent />;

  if (!loading && !globalFeedPosts?.length)
    return (
      <AmityEmptyNewsFeedComponent
        pageId={pageId}
        onPressExploreCommunity={onPressExploreCommunity}
      />
    );

  return (
    <View
      style={styles.container}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <AmityGlobalFeedComponent
        pageId={pageId}
        itemWithAds={itemWithAds}
        refresh={refresh}
        loading={loading}
        onNextPage={onNextPage}
      />
    </View>
  );
};

export default memo(AmityNewsFeedComponent);
