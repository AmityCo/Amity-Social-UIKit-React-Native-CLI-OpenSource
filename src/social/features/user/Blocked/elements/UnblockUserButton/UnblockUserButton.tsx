import { useAmityElement } from '../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../enums';
import {
  Button,
  BUTTON_SIZE,
  ButtonProps,
} from '../../../../../components/Button/Button';

type UnblockUserButtonProps = ButtonProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

export function UnblockUserButton({
  pageId = PageID.blocked_users_page,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.unblock_user_button,
  ...props
}: UnblockUserButtonProps) {
  const { config, isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  if (isExcluded) return null;

  return (
    <Button
      type="secondary"
      size={BUTTON_SIZE.SMALL}
      testID={accessibilityId}
      {...props}
    >
      {config?.text ?? 'Unblock'}
    </Button>
  );
}
