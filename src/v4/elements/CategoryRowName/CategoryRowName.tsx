import React, { FC, memo } from 'react';
import { StyleSheet } from 'react-native';
import { Typography } from '../../component/Typography/Typography';

import { useAmityElement } from '../../hook';
import { PageID, ComponentID, ElementID } from '../../enum';

type CategoryRowNameProps = {
  name: string;
  pageId?: PageID;
  componentId?: ComponentID;
};

const CategoryRowName: FC<CategoryRowNameProps> = ({
  name,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.category_row_name;
  const { themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    name: {
      color: themeStyles?.colors.base,
      flex: 1,
      textAlign: 'left',
    },
  });

  return (
    <Typography.BodyBold style={styles.name} numberOfLines={1}>
      {name}
    </Typography.BodyBold>
  );
};
export default memo(CategoryRowName);
