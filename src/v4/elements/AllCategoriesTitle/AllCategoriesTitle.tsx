import React, { FC, memo } from 'react';
import { StyleSheet } from 'react-native';
import { Typography } from '../../component/Typography/Typography';

import { useAmityElement } from '../../hook';
import { PageID, ComponentID, ElementID } from '../../enum';

type AllCategoriesTitleProps = {
  title: string;
  pageId?: PageID;
  componentId?: ComponentID;
};

const AllCategoriesTitle: FC<AllCategoriesTitleProps> = ({
  title,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.all_categories_title;
  const { themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    title: {
      color: themeStyles?.colors.base,
      flex: 1,
      textAlign: 'center',
    },
  });

  return (
    <Typography.TitleBold style={styles.title} numberOfLines={1}>
      {title}
    </Typography.TitleBold>
  );
};
export default memo(AllCategoriesTitle);
