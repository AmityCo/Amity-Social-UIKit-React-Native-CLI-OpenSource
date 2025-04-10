import { CategoryRepository } from '@amityco/ts-sdk-react-native';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '../styles';

type CategoryItemProps = {
  categoryId: string;
  style?: object;
};

export const CategoryItem: React.FC<CategoryItemProps> = ({ categoryId }) => {
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
    <View style={styles.chipContainer}>
      <Text style={styles.chipText} numberOfLines={1}>
        {category.name}
      </Text>
    </View>
  );
};
