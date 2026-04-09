import { FC, memo } from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../../enums/enumUIKitID';
import AmityGlobalFeedComponent from '../GlobalFeed/GlobalFeed';
import { useStyles } from './styles';
import Divider from '../../../../components/Divider';
import { useAmityComponent } from '../../../../hooks';
import { useCustomRankingGlobalFeed } from '../../../../hooks/useCustomRankingGlobalFeed';
import NewsFeedLoadingComponent from '../../../../components/NewsFeedLoadingComponent/NewsFeedLoadingComponent';
import { AmityEmptyNewsFeedComponent } from '../../../..';

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
      <Divider />
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
