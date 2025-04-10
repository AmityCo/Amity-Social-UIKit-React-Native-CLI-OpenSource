import React, { FC, memo } from 'react';
import { TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../../enum/enumUIKitID';
import useConfig from '../../../hook/useConfig';
import { useAmityElement } from '../../../hook';
import { Button } from '../../../component/Button/Button';
import { plus } from '../../../assets/icons';
import { SvgXml } from 'react-native-svg';

type CommunityJoinButtonElementType = {
  pageId?: PageID;
  componentId?: ComponentID;
} & TouchableOpacityProps;

const CommunityJoinButtonElement: FC<CommunityJoinButtonElementType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}) => {
  // TODO: add theme styles
  const { excludes } = useConfig();

  const elementId = ElementID.community_join_button;
  const configId = `${pageId}/${componentId}/${elementId}`;

  const { config, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  if (excludes.includes(configId)) return null;

  return (
    <Button
      testID={accessibilityId}
      type="primary"
      icon={<SvgXml xml={plus()} />}
      {...props}
    >
      {config.text as string}
    </Button>
  );
};

export default memo(CommunityJoinButtonElement);
