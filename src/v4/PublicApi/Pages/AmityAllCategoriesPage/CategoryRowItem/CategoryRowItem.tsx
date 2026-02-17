import { View } from 'react-native';
import React, { FC, memo } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../../../../social/enums';
import { arrowRight } from '../../../../../core/assets/icons';
import { SvgXml } from 'react-native-svg';
import CategoryRowImage from '../../../../../social/elements/CategoryRowImage/CategoryRowImage';
import CategoryRowName from '../../../../../social/elements/CategoryRowName/CategoryRowName';

type CategoryRowItemProps = {
  pageId?: PageID;
  category: Amity.Category;
};

const CategoryRowItem: FC<CategoryRowItemProps> = ({
  category,
  pageId = PageID.WildCardPage,
}) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <CategoryRowImage pageId={pageId} avatarFileId={category.avatarFileId} />
      <CategoryRowName pageId={pageId} name={category.name} />
      <SvgXml xml={arrowRight()} width={24} height={24} />
    </View>
  );
};

export default memo(CategoryRowItem);
