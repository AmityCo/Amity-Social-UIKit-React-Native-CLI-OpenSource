import React, { FC, memo } from 'react';
import { StyleSheet } from 'react-native';
import { Typography } from '../../component/Typography/Typography';

import { useAmityElement } from '../../hook';
import { PageID, ComponentID, ElementID } from '../../enum';

type CategoryTitleProps = {
  title: string;
  pageId?: PageID;
  componentId?: ComponentID;
};

const CategoryTitle: FC<CategoryTitleProps> = ({
  title,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.category_title;
  const { themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    title: {
      flex: 1,
      color: themeStyles?.colors.base,
      textAlign: 'center',
    },
  });

  return (
    <Typography.TitleBold style={styles.title} numberOfLines={1}>
      {title}
    </Typography.TitleBold>
  );
};
export default memo(CategoryTitle);
