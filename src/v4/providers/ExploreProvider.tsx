// ExploreContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

import {
  useRecommendedCommunities,
  useTrendingCommunities,
  useCategories,
} from '../hook';

interface ExploreContextType {
  refresh: () => void;
  onJoinRecommendedCommunity: (communityId: string) => void;
  recommendedCommunities: Amity.Community[];
  trendingCommunities: Amity.Community[];
  categories: Amity.Category[];
  isCategoryEmpty: boolean;
  isRecommendedCommunitiesEmpty: boolean;
  isTrendingCommunitiesEmpty: boolean;
  isLoading: boolean;
  isAllError: boolean;
  isAllCommunitiesError: boolean;
  hasMoreCategories: boolean;
}

const ExploreContext = createContext<ExploreContextType | undefined>(undefined);

export const ExploreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    onJoinCommunity: onJoinRecommendedCommunity,
    refresh: refreshRecommendedCommunities,
    communities: recommendedCommunities,
    loading: isLoadingRecommendedCommunities,
    error: recommendedCommunitiesError,
  } = useRecommendedCommunities();

  const {
    refresh: refreshTrendingCommunities,
    communities: trendingCommunities,
    loading: isLoadingTrendingCommunities,
    error: trendingCommunitiesError,
  } = useTrendingCommunities();

  const {
    refresh: refreshCategories,
    categories,
    loading: isLoadingCategories,
    hasMore: hasMoreCategories,
    error: categoriesError,
  } = useCategories();

  const refresh = () => {
    refreshRecommendedCommunities();
    refreshTrendingCommunities();
    refreshCategories();
  };

  return (
    <ExploreContext.Provider
      value={{
        refresh,
        recommendedCommunities,
        trendingCommunities,
        categories,
        isLoading:
          isLoadingCategories ||
          isLoadingRecommendedCommunities ||
          isLoadingTrendingCommunities,
        isCategoryEmpty: !isLoadingCategories && categories?.length === 0,
        isRecommendedCommunitiesEmpty:
          !isLoadingRecommendedCommunities &&
          recommendedCommunities?.length === 0,
        isTrendingCommunitiesEmpty:
          !isLoadingTrendingCommunities && trendingCommunities?.length === 0,
        hasMoreCategories,
        isAllError:
          categoriesError &&
          recommendedCommunitiesError &&
          trendingCommunitiesError,
        isAllCommunitiesError:
          recommendedCommunitiesError && trendingCommunitiesError,
        onJoinRecommendedCommunity,
      }}
    >
      {children}
    </ExploreContext.Provider>
  );
};

export const useExplore = () => {
  const context = useContext(ExploreContext);
  if (context === undefined) {
    throw new Error('useExplore must be used within an ExploreProvider');
  }
  return context;
};
