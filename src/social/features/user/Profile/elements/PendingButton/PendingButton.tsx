import { useAmityElement } from '../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../enums';
import {
  Button,
  BUTTON_SIZE,
  ButtonProps,
} from '../../../../../components/Button/Button';
import { pending } from '../../../../../../core/assets/icons';

type PendingButtonProps = ButtonProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

export function PendingButton({
  pageId = PageID.user_profile_page,
  componentId = ComponentID.user_profile_header,
  elementId = ElementID.pending_user_button,
  ...props
}: PendingButtonProps) {
  const { config, isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  if (isExcluded) return null;

  return (
    <Button
      type="secondary"
      size={BUTTON_SIZE.LARGE}
      testID={accessibilityId}
      icon={pending()}
      {...props}
    >
      {config?.text ?? 'Cancel request'}
    </Button>
  );
}
