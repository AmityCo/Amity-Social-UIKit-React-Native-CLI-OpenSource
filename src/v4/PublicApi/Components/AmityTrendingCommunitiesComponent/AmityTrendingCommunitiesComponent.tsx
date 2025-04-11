import React, { FC } from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../enum';
// import { useStyles } from './styles';
import { useAmityComponent } from '../../../hook';
import { TrendingCommunityTitleComponent } from './TrendingCommunityTitle/TrendingCommunityTitle';

type AmityTrendingCommunitiesComponentComponentProps = {
  pageId?: PageID;
};

export const AmityTrendingCommunitiesComponentComponent: FC<
  AmityTrendingCommunitiesComponentComponentProps
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
