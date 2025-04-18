import { View } from 'react-native';
import React, { FC, memo } from 'react';
import { useStyles } from './styles';
import { PageID } from '../../../../enum';
import { arrowRight } from '../../../../assets/icons';
import { SvgXml } from 'react-native-svg';
import CategoryRowImage from '~/v4/elements/CategoryRowImage/CategoryRowImage';
import CategoryRowName from '~/v4/elements/CategoryRowName/CategoryRowName';

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
