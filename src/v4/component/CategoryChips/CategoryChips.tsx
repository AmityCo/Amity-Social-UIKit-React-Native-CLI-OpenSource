import React from 'react';
import { Text, View } from 'react-native';
import { CategoryItem } from './CategoryItem/CategoryItem';
import { useStyles } from './styles';

type CategoryChipsProps = {
  categoryIds: string[];
  maxVisible?: number;
};

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categoryIds,
  maxVisible = 2,
}) => {
  const styles = useStyles();
  const visibleCategories = categoryIds.slice(0, maxVisible);
  const hiddenCategoriesCount = categoryIds.length - maxVisible;
  const showMoreText =
    hiddenCategoriesCount > 0 ? `+${hiddenCategoriesCount}` : '';
  const showMore = hiddenCategoriesCount > 0;

  return (
    <View style={styles.container}>
      {visibleCategories.map((id, index) => (
        <CategoryItem key={index} categoryId={id} />
      ))}
      {showMore && (
        <View style={styles.chipContainer}>
          <Text style={styles.chipText}>{showMoreText}</Text>
        </View>
      )}
    </View>
  );
};
