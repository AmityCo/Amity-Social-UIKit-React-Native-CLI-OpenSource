import { View } from 'react-native';
import React, { memo } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../../enum';
import { useAmityPage, useCategories } from '../../../hook';
import AllCategoriesTitle from '../../../elements/AllCategoriesTitle/AllCategoriesTitle';
import BackButtonIconElement from '../../Elements/BackButtonIconElement/BackButtonIconElement';
import { FlatList } from 'react-native-gesture-handler';
import CategoryRowItem from './CategoryRowItem/CategoryRowItem';

const AmityAllCategoriesPage = () => {
  const pageId = PageID.all_categories_page;
  const { accessibilityId } = useAmityPage({
    pageId,
  });

  const { categories, loading } = useCategories();

  const styles = useStyles();

  // TODO: Add loading state
  if (loading) return null;

  return (
    <View testID={accessibilityId} style={styles.container}>
      <View style={styles.header}>
        <BackButtonIconElement pageID={pageId} />
        <AllCategoriesTitle title={'All Categories'} pageId={pageId} />
        <View style={styles.empty} />
      </View>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryRowItem category={item} pageId={pageId} />
        )}
        keyExtractor={(item) => item.categoryId}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default memo(AmityAllCategoriesPage);
