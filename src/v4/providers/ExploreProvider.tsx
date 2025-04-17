// ExploreContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

import {
  useRecommendedCommunities,
  useTrendingCommunities,
  useCategories,
} from '../hook';

interface ExploreContextType {
  recommendedCommunities: Amity.Community[];
  trendingCommunities: Amity.Community[];
  categories: Amity.Category[];
  isCategoryEmpty: boolean;
  isRecommendedCommunitiesEmpty: boolean;
  isTrendingCommunitiesEmpty: boolean;
  isLoading: boolean;
  hasMoreCategories: boolean;
}

const ExploreContext = createContext<ExploreContextType | undefined>(undefined);

export const ExploreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    communities: recommendedCommunities,
    loading: isLoadingRecommendedCommunities,
  } = useRecommendedCommunities();

  const {
    communities: trendingCommunities,
    loading: isLoadingTrendingCommunities,
  } = useTrendingCommunities();

  const {
    categories,
    loading: isLoadingCategories,
    hasMore: hasMoreCategories,
  } = useCategories();

  return (
    <ExploreContext.Provider
      value={{
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
