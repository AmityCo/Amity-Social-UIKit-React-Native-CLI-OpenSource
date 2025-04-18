import React, { FC } from 'react';
import { Typography } from '../../component/Typography/Typography';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement } from '../../hook';
import { useStyles } from './styles';
import { View, ViewProps } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { lock, verifiedBadge } from '../../assets/icons';

type CommunityDisplaynameProps = {
  community: Amity.Community;
  pageId?: PageID;
  componentId?: ComponentID;
} & ViewProps;

export const CommunityDisplayname: FC<CommunityDisplaynameProps> = ({
  community,
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
    <View {...props} style={[styles.container, props.style]}>
      {!community.isPublic && <SvgXml xml={lock()} />}
      <Typography.TitleBold
        testID={accessibilityId}
        style={styles.displayName}
        numberOfLines={1}
      >
        {community.displayName}
      </Typography.TitleBold>
      {community.isOfficial && <SvgXml xml={verifiedBadge()} />}
    </View>
  );
};
