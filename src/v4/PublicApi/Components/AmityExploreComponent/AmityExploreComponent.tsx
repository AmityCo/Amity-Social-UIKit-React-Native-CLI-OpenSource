import * as React from 'react';

import { View, ScrollView } from 'react-native';
import { useStyles } from './styles';
import { PageID } from '../../../enum';

import AmityRecommendedCommunityComponent from '../AmityRecommenedCommunityComponent/AmityRecommenedCommunityComponent';
import AmityCommunityCategoriesComponent from '../AmityCommunityCategoriesComponent/AmityCommunityCategoriesComponent';
import AmityTrendingCommunitiesComponent from '../AmityTrendingCommunitiesComponent/AmityTrendingCommunitiesComponent';
import AmityExploreCommunityEmptyComponent from '../AmityExploreCommunityEmptyComponent/AmityExploreCommunityEmptyComponent';
import AmityExploreEmptyComponent from '../AmityExploreEmptyComponent/AmityExploreEmptyComponent';
import { useExplore } from '../../../providers/ExploreProvider';
import ExploreLoadingSkeleton from './ExploreLoadingSkeleton/ExploreLoadingSkeleton';
import { useAmityPage } from '../../../hook';

type AmityExploreComponentProps = {
  pageId?: PageID;
};

const AmityExploreComponent: React.FC<AmityExploreComponentProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const styles = useStyles();
  const { themeStyles } = useAmityPage({ pageId });
  const {
    isLoading,
    isCategoryEmpty,
    isRecommendedCommunitiesEmpty,
    isTrendingCommunitiesEmpty,
  } = useExplore();

  const isNothingToShow =
    !isLoading &&
    (isCategoryEmpty ||
      isRecommendedCommunitiesEmpty ||
      isTrendingCommunitiesEmpty);

  const isNoCommunities =
    !isLoading && (isRecommendedCommunitiesEmpty || isTrendingCommunitiesEmpty);

  if (isLoading) return <ExploreLoadingSkeleton themeStyles={themeStyles} />;

  return (
    <ScrollView style={styles.container}>
      {isNothingToShow ? (
        <AmityExploreEmptyComponent pageId={pageId} />
      ) : (
        <>
          <View style={styles.categoriesContainer}>
            <AmityCommunityCategoriesComponent pageId={pageId} />
          </View>
          <View style={styles.communitiesSection}>
            {isNoCommunities ? (
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
        </>
      )}
    </ScrollView>
  );
};

export default AmityExploreComponent;
