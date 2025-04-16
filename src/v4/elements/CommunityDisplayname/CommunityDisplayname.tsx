import React, { FC } from 'react';
import { Typography } from '../../component/Typography/Typography';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement } from '../../hook';
import { useStyles } from './styles';

type CommunityDisplaynameProps = {
  displayName: string;
  pageId?: PageID;
  componentId?: ComponentID;
};

export const CommunityDisplayname: FC<CommunityDisplaynameProps> = ({
  displayName,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.community_display_name;
  const { isExcluded, accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <Typography.TitleBold testID={accessibilityId} style={styles.displayName}>
      {displayName}
    </Typography.TitleBold>
  );
};
