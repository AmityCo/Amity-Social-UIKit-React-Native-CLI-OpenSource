import React, { FC, memo } from 'react';
import { FlatList, View } from 'react-native';
import { arrowRight } from '../../../assets/icons';
import { CategoryChip } from '../../../component/CategoryChip/CategoryChip';
import { useCategories } from '../../../hook/useCategories';
import { ComponentID, PageID } from '../../../enum';
import { useStyles } from './styles';
import { Typography } from '../../../component/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { useAmityComponent } from '../../../hook';

type AmityCommunityCategoriesComponentProps = {
  pageId?: PageID;
};

const AmityCommunityCategoriesComponent: FC<
  AmityCommunityCategoriesComponentProps
> = ({ pageId = PageID.WildCardPage }) => {
  const { categories, hasMore } = useCategories();
  const componentId = ComponentID.explore_community_categories;
  const { isExcluded, accessibilityId, themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });

  const styles = useStyles(themeStyles);

  if (isExcluded && categories.length === 0) return null;

  return (
    <FlatList
      testID={accessibilityId}
      data={categories}
      renderItem={({ item }) => <CategoryChip category={item} />}
      keyExtractor={(item) => item.categoryId}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryChipsContentContainer}
      ListFooterComponent={
        hasMore ? (
          <View style={styles.seeMoreCategoryButton}>
            <Typography.BodyBold style={styles.seeMoreCategoryText}>
              {'See more'}
            </Typography.BodyBold>
            <SvgXml xml={arrowRight()} />
          </View>
        ) : null
      }
    />
  );
};

export default memo(AmityCommunityCategoriesComponent);
