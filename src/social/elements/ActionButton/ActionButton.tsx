import { useAmityElement } from '../../hooks';
import { ComponentID, ElementID, PageID } from '../../enums';
import Button, {
  BUTTON_SIZE,
  ButtonProps,
} from '../../components/Button/Button';
import { useStyles } from './styles';

type ActionButtonProps = ButtonProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  fullWidth?: boolean;
  label?: string;
};

function ActionButton({
  fullWidth = false,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.WildCardElement,
  label,
  ...props
}: ActionButtonProps) {
  const { themeStyles, isExcluded, accessibilityId, config } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const { styles } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <Button
      type="primary"
      testID={accessibilityId}
      size={BUTTON_SIZE.LARGE}
      style={[fullWidth && styles.fullWidth, props.style]}
      {...props}
    >
      {label ?? config?.text}
    </Button>
  );
}

export default ActionButton;
