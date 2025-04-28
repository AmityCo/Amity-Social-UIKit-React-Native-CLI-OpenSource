import React, { FC, memo } from 'react';
import { StyleSheet } from 'react-native';
import { Typography } from '../../component/Typography/Typography';

import { useAmityElement } from '../../hook';
import { PageID, ComponentID, ElementID } from '../../enum';

type CommunityEmptyTitleProps = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityEmptyTitle: FC<CommunityEmptyTitleProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.community_empty_title;
  const { themeStyles, config } = useAmityElement({
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
      {config.text as string}
    </Typography.TitleBold>
  );
};
export default memo(CommunityEmptyTitle);
