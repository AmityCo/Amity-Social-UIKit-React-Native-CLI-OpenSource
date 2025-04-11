import { CategoryRepository } from '@amityco/ts-sdk-react-native';
import React, { useEffect, useState } from 'react';
import { DimensionValue, Text, View } from 'react-native';
import { useStyles } from '../styles';

type CategoryItemProps = {
  categoryId: string;
  style?: object;
  maxWidth?: number | string;
};

export const CategoryItem: React.FC<CategoryItemProps> = ({
  categoryId,
  style,
  maxWidth,
}) => {
  const [category, setCategory] = useState<Amity.Category | null>(null);
  const styles = useStyles();

  useEffect(() => {
    const fetch = async () => {
      const result = await CategoryRepository.getCategory(categoryId);
      setCategory(result.data);
    };

    fetch();
  }, [categoryId]);

  if (category == null) return null;

  return (
    <View
      style={[
        styles.chipContainer,
        maxWidth ? { maxWidth: maxWidth as DimensionValue } : null,
        style,
      ]}
    >
      <Text style={styles.chipText} numberOfLines={1}>
        {category.name}
      </Text>
    </View>
  );
};
