import React, { FC, memo } from 'react';
import { ComponentID, ElementID, PageID } from '../../enum/enumUIKitID';
import { useAmityElement, useLeaveCommunity } from '../../hook';
import { Button, BUTTON_SIZE } from '../../component/Button/Button';
import { SvgXml } from 'react-native-svg';
import { check } from '../../assets/icons';

type CommunityJoinedButtonType = {
  pageId?: PageID;
  componentId?: ComponentID;
  communityId?: string;
};

const CommunityJoinedButton: FC<CommunityJoinedButtonType> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  communityId,
  ...props
}) => {
  const { config, accessibilityId, isExcluded, themeStyles } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.community_joined_button,
  });

  const { leaveCommunity, isPending } = useLeaveCommunity();

  const handleLeaveCommunity = () => {
    if (!communityId) return;
    leaveCommunity(communityId);
  };

  if (isExcluded) return null;

  return (
    <Button
      testID={accessibilityId}
      type="secondary"
      icon={<SvgXml xml={check()} />}
      themeStyle={themeStyles}
      onPress={handleLeaveCommunity}
      disabled={isPending}
      size={BUTTON_SIZE.SMALL}
      {...props}
    >
      {(config?.text as string) || 'Joined'}
    </Button>
  );
};

export default memo(CommunityJoinedButton);
