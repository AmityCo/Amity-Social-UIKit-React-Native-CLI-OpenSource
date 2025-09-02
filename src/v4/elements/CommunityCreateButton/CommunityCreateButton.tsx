import React from 'react';
import { plus } from '~/v4/assets/icons';
import { useAmityElement } from '~/v4/hook';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import Button, { BUTTON_SIZE, ButtonProps } from '~/v4/component/Button/Button';

type CommunityCreateButtonProps = ButtonProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

function CommunityCreateButton({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.community_create_button,
  ...props
}: CommunityCreateButtonProps) {
  const { themeStyles, isExcluded, accessibilityId, config } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  if (isExcluded) return null;

  return (
    <Button
      {...props}
      icon={plus()}
      type="primary"
      themeStyle={themeStyles}
      testID={accessibilityId}
      size={BUTTON_SIZE.LARGE}
    >
      {config?.text as string}
    </Button>
  );
}

export default CommunityCreateButton;
