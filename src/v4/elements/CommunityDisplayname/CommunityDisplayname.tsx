import React, { FC } from 'react';
import { Typography } from '../../component/Typography/Typography';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement } from '../../hook';
import { useStyles } from './styles';
import { ViewProps } from 'react-native';

type CommunityDisplaynameProps = {
  communityName: string;
  pageId?: PageID;
  componentId?: ComponentID;
} & ViewProps;

const CommunityDisplayname: FC<CommunityDisplaynameProps> = ({
  communityName,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
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
    <Typography.TitleBold
      testID={accessibilityId}
      style={styles.displayName}
      numberOfLines={1}
      {...props}
    >
      {communityName?.trim()}
    </Typography.TitleBold>
  );
};

export default CommunityDisplayname;
