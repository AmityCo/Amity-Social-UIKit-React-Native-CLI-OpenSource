import React, { FC, memo } from 'react';
import { StyleSheet } from 'react-native';
import { Typography } from '../../component/Typography/Typography';

import { useAmityElement } from '../../hook';
import { PageID, ComponentID, ElementID } from '../../enum';

type CommunityEmptyTitleProps = {
  title: string;
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityEmptyTitle: FC<CommunityEmptyTitleProps> = ({
  title,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.community_empty_title;
  const { themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    title: {
      color: themeStyles?.colors.baseShade3,
    },
  });

  return (
    <Typography.TitleBold style={styles.title} numberOfLines={1}>
      {title}
    </Typography.TitleBold>
  );
};
export default memo(CommunityEmptyTitle);
