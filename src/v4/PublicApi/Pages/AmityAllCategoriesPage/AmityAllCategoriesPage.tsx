import { View, FlatList, SafeAreaView, Pressable, Text } from 'react-native';
import React, { memo, useCallback } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../../enum';
import { useAmityPage, useCategories } from '../../../hook';
import AllCategoriesTitle from '../../../elements/AllCategoriesTitle/AllCategoriesTitle';
import BackButtonIconElement from '../../Elements/BackButtonIconElement/BackButtonIconElement';
import CategoryRowItem from './CategoryRowItem/CategoryRowItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';

const AmityAllCategoriesPage = () => {
  const pageId = PageID.all_categories_page;
  const { accessibilityId, themeStyles } = useAmityPage({
    pageId,
  });

  const { categories, loading, onNextCategoryPage } = useCategories({
    limit: 20,
  });

  const styles = useStyles(themeStyles);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onPressCategory = useCallback(
    (category: Amity.Category) => {
      navigation.navigate('CommunitiesByCategoryPage', {
        category,
      });
    },
    [navigation]
  );

  // TODO: Add loading state

  return (
    <SafeAreaView testID={accessibilityId} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <BackButtonIconElement pageID={pageId} style={styles.headerIcon} />
        </Pressable>
        <AllCategoriesTitle title={'All Categories'} pageId={pageId} />
        <View style={styles.empty} />
      </View>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <Pressable onPress={() => onPressCategory(item)}>
            <CategoryRowItem category={item} pageId={pageId} />
          </Pressable>
        )}
        keyExtractor={(item) => item.categoryId}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        onEndReached={() => {
          onNextCategoryPage?.();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <Text>Loading</Text> : null}
      />
    </SafeAreaView>
  );
};

export default memo(AmityAllCategoriesPage);
