import React, { FC, memo } from 'react';
import { TouchableOpacityProps } from 'react-native';
import { ComponentID, ElementID, PageID } from '../../enum/enumUIKitID';
import { useAmityElement } from '../../hook';
import { Button } from '../../component/Button/Button';
import { plus } from '../../assets/icons';
import { SvgXml } from 'react-native-svg';

type CommunityJoinButtonType = {
  pageId?: PageID;
  componentId?: ComponentID;
} & TouchableOpacityProps;

const CommunityJoinButton: FC<CommunityJoinButtonType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  ...props
}) => {
  const { config, accessibilityId, isExcluded, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.community_join_button,
  });

  if (isExcluded) return null;

  return (
    <Button
      testID={accessibilityId}
      type="primary"
      icon={<SvgXml xml={plus()} />}
      themeStyle={themeStyles}
      {...props}
    >
      {config.text as string}
    </Button>
  );
};

export default memo(CommunityJoinButton);
