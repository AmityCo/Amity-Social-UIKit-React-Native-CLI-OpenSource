import React, { FC, memo, useCallback } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { arrowRight } from '../../../assets/icons';
import { CategoryChip } from '../../../component/CategoryChip/CategoryChip';
import { ComponentID, PageID } from '../../../enum';
import { useStyles } from './styles';
import { Typography } from '../../../component/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { useAmityComponent } from '../../../hook';
import { useExplore } from '../../../providers/ExploreProvider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';

type AmityCommunityCategoriesComponentProps = {
  pageId?: PageID;
};

const AmityCommunityCategoriesComponent: FC<
  AmityCommunityCategoriesComponentProps
> = ({ pageId = PageID.WildCardPage }) => {
  const { categories, hasMoreCategories } = useExplore();
  const componentId = ComponentID.explore_community_categories;
  const { isExcluded, accessibilityId, themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });

  const styles = useStyles(themeStyles);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goToCommunitiesByCategoryPage = useCallback(
    (category: Amity.Category) => {
      navigation.navigate('CommunitiesByCategoryPage', {
        category,
      });
    },
    [navigation]
  );

  const onPressSeeMore = useCallback(() => {
    navigation.navigate('AllCategoriesPage');
  }, [navigation]);

  if (isExcluded && categories.length === 0) return null;

  return (
    <FlatList
      testID={accessibilityId}
      data={categories}
      renderItem={({ item }) => (
        <Pressable onPress={() => goToCommunitiesByCategoryPage(item)}>
          <CategoryChip category={item} />
        </Pressable>
      )}
      keyExtractor={(item) => item.categoryId}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryChipsContentContainer}
      ListFooterComponent={
        hasMoreCategories ? (
          <Pressable onPress={onPressSeeMore}>
            <View style={styles.seeMoreCategoryButton}>
              <Typography.BodyBold style={styles.seeMoreCategoryText}>
                {'See more'}
              </Typography.BodyBold>
              <SvgXml xml={arrowRight()} />
            </View>
          </Pressable>
        ) : null
      }
    />
  );
};

export default memo(AmityCommunityCategoriesComponent);
