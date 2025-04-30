import React from 'react';
import { Text, View, ViewProps, ScrollView } from 'react-native';
import { CommunityCategoryChip } from './CommunityCategoryChip/CommunityCategoryChip';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';
import { useStyles } from './styles';

type CommunityCategoryChipsProps = ViewProps & {
  themeStyles: MyMD3Theme;
  categoryIds: string[];
  allVisible?: boolean;
};

const MAX_VISIBLE_CATEGORIES = 2;

export const CommunityCategoryChips: React.FC<CommunityCategoryChipsProps> = ({
  categoryIds,
  themeStyles,
  allVisible,
  ...props
}) => {
  const styles = useStyles(themeStyles);
  const visibleCategories = categoryIds.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenCategoriesCount = categoryIds.length - MAX_VISIBLE_CATEGORIES;
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
  const displayCategories = allVisible ? categoryIds : visibleCategories;
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
          {displayCategories.map((id, index) => (
            <CommunityCategoryChip
              key={index}
              categoryId={id}
              maxWidth={getMaxWidthForItem(displayCategories.length)}
              themeStyles={themeStyles}
            />
          ))}
        </ScrollView>
      ) : (
        <>
          {displayCategories.map((id, index) => (
            <CommunityCategoryChip
              key={index}
              categoryId={id}
              maxWidth={getMaxWidthForItem(displayCategories.length)}
              themeStyles={themeStyles}
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
};
