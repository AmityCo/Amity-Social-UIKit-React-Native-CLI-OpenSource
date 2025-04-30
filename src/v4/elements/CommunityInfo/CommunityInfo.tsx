import React, { FC } from 'react';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement } from '../../hook';
import { StyleSheet, ViewProps } from 'react-native';
import { View } from 'react-native';
import { Typography } from '../../component/Typography/Typography';

type CommunityInfoProps = ViewProps & {
  community: Amity.Community;
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityInfo: FC<CommunityInfoProps> = ({
  community,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}) => {
  const elementId = ElementID.community_description;
  const { isExcluded, accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    number: {
      color: themeStyles.colors.base,
    },
    label: {
      color: themeStyles.colors.baseShade2,
    },
    line: {
      height: 20,
      width: 1,
      backgroundColor: themeStyles.colors.baseShade4,
    },
  });

  if (isExcluded) return null;

  const { style, ...rest } = props;

  return (
    <View testID={accessibilityId} {...rest} style={[styles.container, style]}>
      <View style={styles.statItem}>
        <Typography.BodyBold style={styles.number}>
          {community.postsCount}
        </Typography.BodyBold>
        <Typography.Caption style={styles.label}>
          {community.postsCount > 1 ? 'posts' : 'post'}
        </Typography.Caption>
      </View>
      <View style={styles.line} />
      <View style={styles.statItem}>
        <Typography.BodyBold style={styles.number}>
          {community.membersCount}
        </Typography.BodyBold>
        <Typography.Caption style={styles.label}>
          {community.postsCount > 1 ? 'members' : 'member'}
        </Typography.Caption>
      </View>
    </View>
  );
};

export default CommunityInfo;
