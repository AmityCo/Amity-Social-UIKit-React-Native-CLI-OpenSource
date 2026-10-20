import { FC } from 'react';
import { ComponentID, ElementID, PageID } from '../../enums';
import { useAmityElement, useConfigImageUri } from '../../hooks';
import { StyleSheet } from 'react-native';
import { Image } from 'react-native';

type CommunityPrivateBadgeProps = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityPrivateBadge: FC<CommunityPrivateBadgeProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.community_private_badge;
  const { config, isExcluded, accessibilityId, themeStyles } = useAmityElement({
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
    // Some config entries, and host configs copied from them, set this badge
    // under `icon` rather than `image`. Reading only `image` drew the default
    // avatar in its place.
    configKey: config?.icon && !config?.image ? 'icon' : 'image',
  });

  const styles = StyleSheet.create({
    image: {
      width: 24,
      height: 24,
      tintColor: themeStyles.colors.base,
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

export default CommunityPrivateBadge;
