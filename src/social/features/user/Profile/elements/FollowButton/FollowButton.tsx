import { useAmityElement } from '../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../enums';
import {
  Button,
  BUTTON_SIZE,
  ButtonProps,
} from '../../../../../components/Button/Button';
import { plus } from '../../../../../../core/assets/icons';

type FollowButtonProps = ButtonProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

export function FollowButton({
  pageId = PageID.user_profile_page,
  componentId = ComponentID.user_profile_header,
  elementId = ElementID.follow_user_button,
  ...props
}: FollowButtonProps) {
  const { config, isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  if (isExcluded) return null;

  return (
    <Button
      type="primary"
      size={BUTTON_SIZE.LARGE}
      testID={accessibilityId}
      icon={plus()}
      {...props}
    >
      {config?.text ?? 'Follow'}
    </Button>
  );
}
