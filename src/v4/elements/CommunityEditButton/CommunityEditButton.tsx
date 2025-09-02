import React from 'react';
import { useAmityElement } from '~/v4/hook';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import Button, { BUTTON_SIZE, ButtonProps } from '~/v4/component/Button/Button';

type CommunityEditButtonProps = ButtonProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

function CommunityEditButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.community_edit_button,
  ...props
}: CommunityEditButtonProps) {
  const { themeStyles, isExcluded, accessibilityId, config } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  if (isExcluded) return null;

  return (
    <Button
      {...props}
      type="primary"
      themeStyle={themeStyles}
      testID={accessibilityId}
      size={BUTTON_SIZE.LARGE}
    >
      {config?.text as string}
    </Button>
  );
}

export default CommunityEditButton;
