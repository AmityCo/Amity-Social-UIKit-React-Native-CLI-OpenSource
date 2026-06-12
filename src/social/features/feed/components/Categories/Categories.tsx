import { FC, memo, useCallback } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { arrowRight } from '../../../../../core/assets/icons';
import CategoryChip from '../../../../components/CategoryChip/CategoryChip';
import { ComponentID, PageID } from '../../../../enums';
import { useStyles } from './styles';
import { Typography } from '../../../../../core/components/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { useAmityComponent } from '../../../../hooks';
import { useExplore } from '../../../../providers/ExploreProvider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../core/routes/RouteParamList';

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

  const onPressCategory = useCallback(
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
        <Pressable onPress={() => onPressCategory(item)}>
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
              <SvgXml
                width={20}
                height={20}
                xml={arrowRight()}
                color={themeStyles.colors.base}
              />
            </View>
          </Pressable>
        ) : null
      }
    />
  );
};

export default memo(AmityCommunityCategoriesComponent);
