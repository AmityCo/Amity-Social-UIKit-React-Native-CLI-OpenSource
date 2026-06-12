import { View, FlatList, Pressable } from 'react-native';
import { memo, useCallback } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../enums';
import { useAmityPage, useCategories } from '../../hooks';
import AllCategoriesTitle from '../../elements/AllCategoriesTitle/AllCategoriesTitle';
import BackButtonIconElement from '../../elements/BackButtonIconElement/BackButtonIconElement';
import CategoryRowItem from './CategoryRowItem/CategoryRowItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import CategoryListSkeleton from './CategoryListSkeleton/CategoryListSkeleton';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        ListFooterComponent={
          loading ? (
            <CategoryListSkeleton
              themeStyle={themeStyles}
              amount={!categories ? 20 : 4}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default memo(AmityAllCategoriesPage);
