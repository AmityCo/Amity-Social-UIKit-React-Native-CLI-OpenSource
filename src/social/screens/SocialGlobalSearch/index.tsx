import React, { memo, useState } from 'react';
import { useStyles } from './styles';
import AmityTopSearchBarComponent from '../../features/search/components/TopSearchBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAmityGlobalSearchViewModel } from '../../hooks';
import { TabName } from '../../enums/enumTabName';
import CustomTab from '../../components/CustomTab';
import AmityCommunitySearchResultComponent from '../../features/search/components/CommunitySearchResult';
import { PageID } from '../../enums';
import { useAmityPage } from '../../hooks';
import AmityUserSearchResultComponent from '../../features/search/components/UserSearchResult';
import CommunityListSkeleton from '../../components/CommunityListSkeleton/CommunityListSkeleton';
import { View } from 'react-native';

const AmitySocialGlobalSearchPage = () => {
  const pageId = PageID.social_global_search_page;
  const { isExcluded, themeStyles } = useAmityPage({ pageId });
  const styles = useStyles(themeStyles);
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState(TabName.Communities);

  const { searchResult, onNextCommunityPage, onNextUserPage, isLoading } =
    useAmityGlobalSearchViewModel(searchValue, searchType);

  const renderCommunitySkeleton = (length = 12) => (
    <View style={styles.communityListSkeleton}>
      <CommunityListSkeleton
        themeStyle={themeStyles}
        amount={length}
        hasTitle={false}
      />
    </View>
  );
  const isCommunity = searchType === TabName.Communities;
  if (isExcluded) return null;
  return (
    <SafeAreaView style={styles.container}>
      <AmityTopSearchBarComponent
        searchType={searchType}
        setSearchValue={setSearchValue}
      />
      <CustomTab
        onTabChange={setSearchType}
        tabName={[TabName.Communities, TabName.Users]}
      />
      {isCommunity ? (
        <>
          {isLoading && !searchResult && renderCommunitySkeleton()}
          <AmityCommunitySearchResultComponent
            pageId={pageId}
            searchType={searchType}
            searchResult={searchResult}
            onNextPage={onNextCommunityPage}
          />
          {isLoading && renderCommunitySkeleton(4)}
        </>
      ) : (
        <AmityUserSearchResultComponent
          pageId={pageId}
          searchResult={searchResult}
          onNextPage={onNextUserPage}
        />
      )}
    </SafeAreaView>
  );
};

export default memo(AmitySocialGlobalSearchPage);
