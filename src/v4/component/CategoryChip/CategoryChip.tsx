import React, { FC, useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Typography } from '../Typography/Typography';
import { useStyles } from './styles';
import { useFile } from '../../hook';
import { SvgXml } from 'react-native-svg';
import { category as categoryIcon } from '../../assets/icons';

type CategoryChipProps = {
  category: Amity.Category;
};

export const CategoryChip: FC<CategoryChipProps> = ({ category }) => {
  const styles = useStyles();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const { getImage } = useFile();

  useEffect(() => {
    if (!category.avatarFileId) return;

    const fetchImage = async () => {
      const url = await getImage({
        fileId: category.avatarFileId,
      });
      setImageUrl(url);
    };

    fetchImage();
  }, [category.avatarFileId, getImage]);

  return (
    <View style={styles.container}>
      {category.avatarFileId && imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.categoryImage} />
      ) : (
        <View style={styles.categoryImagePlaceholder}>
          <SvgXml xml={categoryIcon()} />
        </View>
      )}

      <Typography.BodyBold style={styles.categoryName}>
        {category.name}
      </Typography.BodyBold>
    </View>
  );
};
