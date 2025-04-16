import * as React from 'react';

import { View, ScrollView } from 'react-native';
import { useStyles } from './styles';
import { PageID } from '../../../enum';

import AmityRecommendedCommunityComponent from '../AmityRecommenedCommunityComponent/AmityRecommenedCommunityComponent';
import AmityCommunityCategoriesComponent from '../AmityCommunityCategoriesComponent/AmityCommunityCategoriesComponent';
import AmityTrendingCommunitiesComponent from '../AmityTrendingCommunitiesComponent/AmityTrendingCommunitiesComponent';

type AmityExploreComponentProps = {
  pageId?: PageID;
};

const AmityExploreComponent: React.FC<AmityExploreComponentProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const styles = useStyles();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.categoriesContainer}>
        <AmityCommunityCategoriesComponent pageId={pageId} />
      </View>
      <View style={styles.recommendContainer}>
        <AmityRecommendedCommunityComponent pageId={pageId} />
      </View>
      <View style={styles.trendingContainer}>
        <AmityTrendingCommunitiesComponent pageId={pageId} />
      </View>
    </ScrollView>
  );
};

export default AmityExploreComponent;
