import React, { FC, memo } from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../enum';
// import { useStyles } from './styles';
import { useAmityComponent } from '../../../hook';
import TrendingCommunityTitleComponent from './TrendingCommunityTitle/TrendingCommunityTitle';

type AmityTrendingCommunitiesCommunityProps = {
  pageId?: PageID;
};

const AmityTrendingCommunitiesCommunity: FC<
  AmityTrendingCommunitiesCommunityProps
> = ({ pageId = PageID.WildCardPage }) => {
  const componentId = ComponentID.trending_communities;
  const { isExcluded, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });

  // const styles = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <View testID={accessibilityId}>
      <TrendingCommunityTitleComponent pageId={pageId} />
    </View>
  );
};

export default memo(AmityTrendingCommunitiesCommunity);
