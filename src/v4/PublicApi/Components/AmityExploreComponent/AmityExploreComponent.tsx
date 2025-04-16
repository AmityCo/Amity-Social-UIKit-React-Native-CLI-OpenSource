import * as React from 'react';

import { View, ScrollView } from 'react-native';
import { useStyles } from './styles';
import { PageID } from '../../../enum';

import AmityRecommendedCommunityComponent from '../AmityRecommenedCommunityComponent/AmityRecommenedCommunityComponent';
import AmityCommunityCategoriesComponent from '../AmityCommunityCategoriesComponent/AmityCommunityCategoriesComponent';
import AmityTrendingCommunitiesComponent from '../AmityTrendingCommunitiesComponent/AmityTrendingCommunitiesComponent';
import { useCommunities } from '../../../hook';
import AmityExploreCommunityEmptyComponent from '../AmityExploreCommunityEmptyComponent/AmityExploreCommunityEmptyComponent';

type AmityExploreComponentProps = {
  pageId?: PageID;
};

const AmityExploreComponent: React.FC<AmityExploreComponentProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const styles = useStyles();
  const { communities, loading } = useCommunities();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.categoriesContainer}>
        <AmityCommunityCategoriesComponent pageId={pageId} />
      </View>
      <View style={styles.communitiesSection}>
        {!loading && communities?.length !== 0 ? (
          <AmityExploreCommunityEmptyComponent pageId={pageId} />
        ) : (
          <>
            <View style={styles.recommendContainer}>
              <AmityRecommendedCommunityComponent pageId={pageId} />
            </View>
            <View style={styles.trendingContainer}>
              <AmityTrendingCommunitiesComponent pageId={pageId} />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default AmityExploreComponent;
