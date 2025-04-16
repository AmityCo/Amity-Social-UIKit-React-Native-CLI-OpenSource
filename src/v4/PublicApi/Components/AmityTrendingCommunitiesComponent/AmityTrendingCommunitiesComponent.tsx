import React, { FC, memo } from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../enum';
import { useStyles } from './styles';
import { useAmityComponent } from '../../../hook';
import { useTrendingCommunities } from '../../../hook/useTrendingCommunities';
import TrendingCommunityTitleComponent from './TrendingCommunityTitle/TrendingCommunityTitle';
import TrendingCommunityItem from './TrendingCommunityItem/TrendingCommunityItem';

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

  const { communities } = useTrendingCommunities();

  const styles = useStyles();

  if (isExcluded || communities.length === 0) return null;

  return (
    <View testID={accessibilityId}>
      <TrendingCommunityTitleComponent pageId={pageId} />
      <View style={styles.container}>
        {communities?.map((community, index) => {
          return (
            <TrendingCommunityItem
              key={community.communityId}
              pageId={pageId}
              community={community}
              label={`0${index + 1}`}
            />
          );
        })}
      </View>
    </View>
  );
};

export default memo(AmityTrendingCommunitiesCommunity);
