import React, { FC } from 'react';
import { Typography } from '../../component/Typography/Typography';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement } from '../../hook';
import { StyleSheet, ViewProps } from 'react-native';

type CommunityNameProps = {
  communityName: string;
  pageId?: PageID;
  componentId?: ComponentID;
} & ViewProps;

const CommunityName: FC<CommunityNameProps> = ({
  communityName,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}) => {
  const elementId = ElementID.community_name;
  const { isExcluded, accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    displayName: {
      color: themeStyles.colors.base,
      flexShrink: 1,
    },
  });

  if (isExcluded) return null;

  return (
    <Typography.Headline
      testID={accessibilityId}
      style={styles.displayName}
      numberOfLines={2}
      {...props}
    >
      {communityName}
    </Typography.Headline>
  );
};

export default CommunityName;
