import React from 'react';
import { Text, View, ViewProps, ScrollView } from 'react-native';
import { CommunityCategory } from '../../elements/CommunityCategory/CommunityCategory';
import { useStyles } from './styles';
import { ComponentID, PageID } from '../../../../enum';

type CommunityCategoriesProps = ViewProps & {
  categories: Amity.Category[];
  pageId?: PageID;
  componentId?: ComponentID;
  allVisible?: boolean;
};

const MAX_VISIBLE_CATEGORIES = 2;

export function CommunityCategories({
  categories = [],
  allVisible,
  ...props
}: CommunityCategoriesProps) {
  const { styles } = useStyles();
  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenCategoriesCount = categories.length - MAX_VISIBLE_CATEGORIES;
  const showMoreText =
    hiddenCategoriesCount > 0 ? `+${hiddenCategoriesCount}` : '';
  const showMore = hiddenCategoriesCount > 0;

  // Dynamic maxWidth based on number of visible categories
  const getMaxWidthForItem = (totalVisibleItems: number) => {
    // If allVisible is true, return 100% for all items
    if (allVisible) {
      return '100%';
    }

    // If only 1 visible category, let it use more space (but still have some limit)
    if (totalVisibleItems === 1 && !showMore) {
      return '100%'; // Use percentage for flexibility
    }

    if (totalVisibleItems === 2 && !showMore) {
      return '50%'; // Use percentage for flexibility
    }

    // More restrictive as items increase
    if (totalVisibleItems === 2 || showMore) {
      return '40%'; // Match your existing maxWidth
    }

    // Default case
    return '40%';
  };

  // Choose all categories or just the visible ones based on allVisible
  const displayCategories = allVisible ? categories : visibleCategories;
  // Only show more indicator if not showing all categories
  const displayShowMore = !allVisible && showMore;

  return (
    <View style={styles.container} {...props}>
      {allVisible ? (
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollableContainer}
        >
          {displayCategories.map((category, index) => (
            <CommunityCategory
              key={index}
              categoryName={category.name}
              maxWidth={getMaxWidthForItem(displayCategories.length)}
            />
          ))}
        </ScrollView>
      ) : (
        <>
          {displayCategories.map((category, index) => (
            <CommunityCategory
              key={index}
              categoryName={category.name}
              maxWidth={getMaxWidthForItem(displayCategories.length)}
            />
          ))}
          {displayShowMore && (
            <View style={styles.chipContainer}>
              <Text style={styles.chipText}>{showMoreText}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}
