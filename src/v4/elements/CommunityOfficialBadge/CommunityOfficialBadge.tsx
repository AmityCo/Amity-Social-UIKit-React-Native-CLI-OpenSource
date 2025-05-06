import React, { FC } from 'react';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement, useConfigImageUri } from '../../hook';
import { StyleSheet } from 'react-native';
import { Image } from 'react-native';

type CommunityOfficialBadgeProps = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityOfficialBadge: FC<CommunityOfficialBadgeProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.community_official_badge;
  const { isExcluded, accessibilityId, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const { uri } = useConfigImageUri({
    configPath: {
      page: pageId,
      component: componentId,
      element: elementId,
    },
    configKey: 'image',
  });

  const styles = StyleSheet.create({
    image: {
      width: 20,
      height: 20,
      tintColor: themeStyles.colors.primary,
    },
  });

  if (isExcluded) return null;

  return (
    <Image
      testID={accessibilityId}
      source={{ uri }}
      resizeMode="cover"
      style={styles.image}
    />
  );
};

export default CommunityOfficialBadge;
