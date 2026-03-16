import React, { FC, memo } from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../enum/enumUIKitID';
import AmityGlobalFeedComponent from '../AmityGlobalFeedComponent/AmityGlobalFeedComponent';
import { useStyles } from './styles';
import Divider from '../../../component/Divider';
import { useAmityComponent } from '../../../hook';
import { useCustomRankingGlobalFeed } from '../../../hook/useCustomRankingGlobalFeed';
import NewsFeedLoadingComponent from '../../../component/NewsFeedLoadingComponent/NewsFeedLoadingComponent';
import AmityEmptyNewsFeedComponent from '../AmityEmptyNewsFeedComponent/AmityEmptyNewsFeedComponent';

type AmityNewsFeedComponentType = {
  pageId?: PageID;
  onPressExploreCommunity?: () => void;
};

const AmityNewsFeedComponent: FC<AmityNewsFeedComponentType> = ({
  pageId = PageID.WildCardPage,
  onPressExploreCommunity,
}) => {
  const componentId = ComponentID.newsfeed_component;
  const { themeStyles, accessibilityId, isExcluded } = useAmityComponent({
    pageId,
    componentId,
  });

  const { itemWithAds, refresh, globalFeedPosts, loading, onNextPage } =
    useCustomRankingGlobalFeed();

  const styles = useStyles();
  if (isExcluded) return null;

  if (loading || (globalFeedPosts?.length > 0 && !itemWithAds?.length))
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
      <Divider themeStyles={themeStyles} />
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
