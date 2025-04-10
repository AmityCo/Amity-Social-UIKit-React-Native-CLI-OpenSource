import { Image } from 'react-native';
import React, { FC, memo } from 'react';
import {
  ComponentID,
  ElementID,
  PageID,
  UiKitConfigKeys,
} from '../../../enum/enumUIKitID';
import useConfig from '../../../hook/useConfig';
import { useAmityElement, useConfigImageUri } from '../../../hook';
import { Button } from '../../../component/Button/Button';

type CommunityJoinButtonElementType = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityJoinButtonElement: FC<CommunityJoinButtonElementType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}) => {
  // TODO: add theme styles
  const { excludes } = useConfig();

  const elementId = ElementID.community_join_button;
  const configKey: keyof UiKitConfigKeys = 'icon';
  const configId = `${pageId}/${componentId}/${elementId}`;

  const { config, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const imageSource = useConfigImageUri({
    configPath: {
      page: pageId,
      component: componentId,
      element: elementId,
    },
    configKey: configKey,
  });

  if (excludes.includes(configId)) return null;

  return (
    <Button
      testID={accessibilityId}
      type="primary"
      icon={<Image source={imageSource} />}
      {...props}
    >
      {config.text as string}
    </Button>
  );
};

export default memo(CommunityJoinButtonElement);
