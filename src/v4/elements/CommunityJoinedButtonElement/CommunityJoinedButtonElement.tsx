import React, { FC, memo } from 'react';
import { ComponentID, ElementID, PageID } from '../../enum/enumUIKitID';
import { useAmityElement } from '../../hook';
import { Button } from '../../component/Button/Button';
import { SvgXml } from 'react-native-svg';
import { check } from '../../assets/icons';

type CommunityJoinedButtonElementType = {
  pageId?: PageID;
  componentId?: ComponentID;
};

const CommunityJoinedButtonElement: FC<CommunityJoinedButtonElementType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}) => {
  const { config, accessibilityId, isExcluded, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.community_joined_button,
  });

  if (isExcluded) return null;

  return (
    <Button
      testID={accessibilityId}
      type="secondary"
      icon={<SvgXml xml={check()} />}
      themeStyle={themeStyles}
      {...props}
    >
      {config.text as string}
    </Button>
  );
};

export default memo(CommunityJoinedButtonElement);
