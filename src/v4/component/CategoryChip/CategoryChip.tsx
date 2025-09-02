import React from 'react';
import { View } from 'react-native';
import { Typography } from '../Typography/Typography';
import { useStyles } from './styles';
import Avatar from '../Avatar';
import { CloseButton } from '~/v4/elements';

type CategoryChipProps = {
  category: Amity.Category;
  onPress?: (category: Amity.Category) => void;
};

function CategoryChip({ category, onPress }: CategoryChipProps) {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.categoryChip}>
      <Avatar.Category
        iconProps={{ width: 28, height: 28 }}
        uri={category.avatar?.fileUrl}
        imageStyle={styles.categoryAvatar}
      />
      <Typography.BodyBold
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.categoryName}
      >
        {category.name}
      </Typography.BodyBold>
      {onPress && (
        <CloseButton
          onPress={() => onPress(category)}
          iconProps={{ color: theme.colors.baseShade1 }}
        />
      )}
    </View>
  );
}

export default CategoryChip;
