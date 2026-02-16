import React, { FC, memo } from 'react';
import {
  ComponentID,
  ElementID,
  PageID,
} from '../../../social/enums/enumUIKitID';
import { useAmityElement, useLeaveCommunity } from '../../../social/hooks';
import { Button, BUTTON_SIZE } from '../../../social/components/Button/Button';
import { check } from '../../../core/assets/icons';

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
      icon={check(
        themeStyles.isDarkTheme ? themeStyles.colors.baseShade1 : undefined
      )}
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
