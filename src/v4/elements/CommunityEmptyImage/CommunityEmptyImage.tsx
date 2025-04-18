import React, { FC, memo } from 'react';
import { StyleSheet, Image } from 'react-native';
import { useConfigImageUri } from '../../hook/useConfigImageUri';
import { useAmityElement } from '../../hook';
import { PageID, ComponentID, ElementID } from '../../enum';

type CommunityEmptyImageProps = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityEmptyImage: FC<CommunityEmptyImageProps> = ({
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
    image: {
      width: 60,
      height: 60,
      tintColor: themeStyles.colors.secondaryShade4,
    },
  });

  const emptyListIcon = useConfigImageUri({
    configPath: {
      page: pageId,
      component: componentId,
      element: ElementID.community_empty_image,
    },
    configKey: 'icon',
  });

  return <Image source={emptyListIcon} style={styles.image} />;
};
export default memo(CommunityEmptyImage);
