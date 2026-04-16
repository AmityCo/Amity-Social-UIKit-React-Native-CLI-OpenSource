import { useAmityElement } from '../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../enums';
import {
  Button,
  BUTTON_SIZE,
  ButtonProps,
} from '../../../../../components/Button/Button';
import { block } from '../../../../../../core/assets/icons';

type UnblockButtonProps = ButtonProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

export function UnblockButton({
  pageId = PageID.user_profile_page,
  componentId = ComponentID.user_profile_header,
  elementId = ElementID.unblock_user_button,
  ...props
}: UnblockButtonProps) {
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
      icon={block()}
      {...props}
    >
      {config?.text ?? 'Unblock'}
    </Button>
  );
}
