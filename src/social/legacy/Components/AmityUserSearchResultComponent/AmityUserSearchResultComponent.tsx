import { FlatList, StyleSheet, View } from 'react-native';
import React, { FC, memo } from 'react';
import { TabName } from '../../../enums/enumTabName';
import SearchResultItem from '../../../components/SearchResultItem/SearchResultItem';
import { ComponentID, PageID } from '../../../enums';
import { useAmityComponent } from '../../../hooks';

type AmityUserSearchResultComponentType = {
  pageId?: PageID;
  searchResult: Amity.Community[] & Amity.User[];
  onNextPage: () => void;
};

const AmityUserSearchResultComponent: FC<
  AmityUserSearchResultComponentType
> = ({ searchResult, onNextPage, pageId = PageID.WildCardPage }) => {
  const searchType = TabName.Users;
  const componentId = ComponentID.community_search_result;
  const { isExcluded } = useAmityComponent({ pageId, componentId });
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  const renderSearchResultItem = ({
    item,
  }: {
    item: Amity.Community & Amity.User;
  }) => {
    return (
      <SearchResultItem
        item={item}
        searchType={searchType}
        pageId={pageId}
        componentId={componentId}
      />
    );
  };

  if (isExcluded) return null;
  if (!searchResult?.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={searchResult}
        renderItem={renderSearchResultItem}
        keyExtractor={(_, index) => index.toString()}
        onEndReached={() => {
          onNextPage && onNextPage();
        }}
      />
    </View>
  );
};

export default memo(AmityUserSearchResultComponent);
