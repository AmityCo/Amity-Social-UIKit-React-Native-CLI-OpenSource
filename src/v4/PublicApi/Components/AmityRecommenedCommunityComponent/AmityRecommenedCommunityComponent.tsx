import React, { FC, memo } from 'react';
import { Text, FlatList, View } from 'react-native';
import { RecommendedCommunityItem } from './RecommenedCommunityItems/RecommenedCommunityItems';
import { useStyles } from './styles';
import { ComponentID, ElementID, PageID } from '../../../enum';
import { useAmityElement } from '../../../hook';
import { useExplore } from '../../../providers/ExploreProvider';

type AmityRecommendedCommunityComponentProps = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const AmityRecommendedCommunityComponent: FC<
  AmityRecommendedCommunityComponentProps
> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.explore_recommended_title;

  const { config, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = useStyles();
  const { recommendedCommunities } = useExplore();

  return (
    <View testID={accessibilityId}>
      <Text style={styles.headerText}>{config.text as string}</Text>
      <FlatList
        horizontal={true}
        data={recommendedCommunities}
        renderItem={({ item }) => (
          <RecommendedCommunityItem pageId={pageId} community={item} />
        )}
        keyExtractor={(item) => item.communityId}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default memo(AmityRecommendedCommunityComponent);
