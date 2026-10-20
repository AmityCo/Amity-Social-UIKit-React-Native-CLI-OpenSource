import { FC } from 'react';
import { ComponentID, ElementID, PageID } from '../../enums';
import { useAmityElement, useConfigImageUri } from '../../hooks';
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
