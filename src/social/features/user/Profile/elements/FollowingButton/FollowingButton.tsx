import { useAmityElement } from '../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../enums';
import {
  Button,
  BUTTON_SIZE,
  ButtonProps,
} from '../../../../../components/Button/Button';
import { following } from '../../../../../../core/assets/icons';

type FollowingButtonProps = ButtonProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
};

export function FollowingButton({
  pageId = PageID.user_profile_page,
  componentId = ComponentID.user_profile_header,
  elementId = ElementID.following_user_button,
  ...props
}: FollowingButtonProps) {
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
      icon={following()}
      {...props}
    >
      {config?.text ?? 'Following'}
    </Button>
  );
}
