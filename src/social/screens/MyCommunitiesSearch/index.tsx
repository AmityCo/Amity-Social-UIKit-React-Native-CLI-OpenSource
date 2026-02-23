import React, { memo, useState } from 'react';
import { useStyles } from './styles';
import AmityTopSearchBarComponent from '../../features/search/components/TopSearchBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAmityGlobalSearchViewModel } from '../../hooks';
import { TabName } from '../../enums/enumTabName';
import { PageID } from '../../enums';
import { useAmityPage } from '../../hooks';
import NoSearchResult from '../../components/NoSearchResult/NoSearchResult';
import CommunitySearchResult from '../../components/CommunitySearchResult/CommunitySearchResult';

const AmityMyCommunitiesSearchPage = () => {
  const pageId = PageID.social_global_search_page;
  const { isExcluded, themeStyles } = useAmityPage({ pageId });
  const styles = useStyles(themeStyles);
  const [searchValue, setSearchValue] = useState<null | string>(null);
  const searchType = TabName.MyCommunities;
  const { searchResult, onNextMyCommunityPage, isLoading } =
    useAmityGlobalSearchViewModel(searchValue, searchType);

  if (isExcluded) return null;
  return (
    <SafeAreaView style={styles.container}>
      <AmityTopSearchBarComponent
        searchType={searchType}
        setSearchValue={setSearchValue}
      />
      {!isLoading && searchResult?.length === 0 ? (
        <NoSearchResult />
      ) : (
        <CommunitySearchResult
          pageId={pageId}
          isFirstTimeLoading={isLoading && !searchResult}
          isLoading={isLoading}
          communities={searchResult}
          onNextPage={onNextMyCommunityPage}
        />
      )}
    </SafeAreaView>
  );
};

export default memo(AmityMyCommunitiesSearchPage);
