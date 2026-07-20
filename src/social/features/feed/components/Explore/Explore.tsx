import { useCallback, useState } from 'react';

import { View, ScrollView, RefreshControl } from 'react-native';
import { useStyles } from './styles';
import { PageID } from '../../../../enums';

import AmityRecommendedCommunityComponent from '../RecommendedCommunities';
import AmityCommunityCategoriesComponent from '../Categories';
import AmityTrendingCommunitiesComponent from '../TrendingCommunities';
import AmityPinnedCommunitiesComponent from '../PinnedCommunities';
import AmityExploreCommunityEmptyComponent from '../ExploreCommunityEmpty';
import AmityExploreEmptyComponent from '../ExploreEmpty';
import { useExplore } from '../../../../providers/ExploreProvider';
import ExploreLoadingSkeleton from './ExploreLoadingSkeleton/ExploreLoadingSkeleton';
import { useAmityPage } from '../../../../hooks';
import ErrorComponent from '../../../../components/ErrorComponent/ErrorComponent';

type AmityExploreComponentProps = {
  pageId?: PageID;
};

const AmityExploreComponent: React.FC<AmityExploreComponentProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const styles = useStyles();
  const { themeStyles } = useAmityPage({ pageId });
  const [refreshing, setRefreshing] = useState(false);
  const {
    refresh,
    isLoading,
    isCategoryEmpty,
    isRecommendedCommunitiesEmpty,
    isTrendingCommunitiesEmpty,
    isPinnedCommunitiesEmpty,
    isAllError,
    isAllCommunitiesError,
  } = useExplore();

  const onRefresh = () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  };

  const isNothingToShow =
    !isLoading &&
    isCategoryEmpty &&
    isRecommendedCommunitiesEmpty &&
    isTrendingCommunitiesEmpty &&
    isPinnedCommunitiesEmpty;

  const isNoCommunities =
    !isLoading &&
    isRecommendedCommunitiesEmpty &&
    isTrendingCommunitiesEmpty &&
    !isCategoryEmpty;

  const renderError = useCallback(() => {
    return (
      <ErrorComponent
        themeStyle={themeStyles}
        title="Something went wrong"
        description="Please try again."
      />
    );
  }, [themeStyles]);

  if (isAllError) {
    return renderError();
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['lightblue']}
          tintColor="lightblue"
        />
      }
    >
      {isLoading && <ExploreLoadingSkeleton themeStyles={themeStyles} />}
      {isNothingToShow ? (
        <View style={styles.emptyContainer}>
          <AmityExploreEmptyComponent pageId={pageId} />
        </View>
      ) : (
        <>
          {!isCategoryEmpty && (
            <View style={styles.categoriesContainer}>
              <AmityCommunityCategoriesComponent pageId={pageId} />
            </View>
          )}
          {/* Pinned communities: below the category chips, above Recommended.
              Self-hides when empty; component also returns null defensively. */}
          {!isPinnedCommunitiesEmpty && (
            <View style={styles.pinnedContainer}>
              <AmityPinnedCommunitiesComponent pageId={pageId} />
            </View>
          )}
          <View style={styles.communitiesSection}>
            {isAllCommunitiesError ? (
              <View style={styles.sectionErrorContainer}>{renderError()}</View>
            ) : isNoCommunities ? (
              <View style={styles.emptyContainer}>
                <AmityExploreCommunityEmptyComponent pageId={pageId} />
              </View>
            ) : (
              <>
                {!isRecommendedCommunitiesEmpty && (
                  <View style={styles.recommendContainer}>
                    <AmityRecommendedCommunityComponent pageId={pageId} />
                  </View>
                )}
                {!isTrendingCommunitiesEmpty && (
                  <View style={styles.trendingContainer}>
                    <AmityTrendingCommunitiesComponent pageId={pageId} />
                  </View>
                )}
              </>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default AmityExploreComponent;
