import React, { FC, memo } from 'react';
import { ComponentID, ElementID, PageID } from '../../../enum/enumUIKitID';
import useConfig from '../../../hook/useConfig';
import { useAmityElement } from '../../../hook';
import { Button } from '../../../component/Button/Button';
import { SvgXml } from 'react-native-svg';
import { check } from '../../../assets/icons';

type CommunityJoinedButtonElementType = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityJoinedButtonElement: FC<CommunityJoinedButtonElementType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}) => {
  // TODO: add theme styles
  const { excludes } = useConfig();

  const elementId = ElementID.community_joined_button;
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
      type="secondary"
      icon={<SvgXml xml={check()} />}
      {...props}
    >
      {config.text as string}
    </Button>
  );
};

export default memo(CommunityJoinedButtonElement);
