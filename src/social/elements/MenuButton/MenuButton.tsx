import { menu, verticalMenu } from '../../../core/assets/icons';
import { useAmityElement } from '../../hooks';
import { SvgXml, XmlProps } from 'react-native-svg';
import { ComponentID, ElementID, PageID } from '../../enums';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useStyles } from './styles';

type MenuButtonProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  variant?: 'default' | 'filled' | 'vertical';
  iconProps?: Pick<XmlProps, 'width' | 'height' | 'color'>;
};

function MenuButton({
  iconProps,
  variant = 'default',
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.menu_button,
  ...props
}: MenuButtonProps) {
  const { isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const { theme, styles } = useStyles();

  if (isExcluded) return null;

  return (
    <TouchableOpacity
      {...props}
      hitSlop={16}
      testID={accessibilityId}
      style={[variant === 'filled' && styles.filledContainer, props.style]}
    >
      <SvgXml
        width="24"
        height="24"
        xml={variant === 'vertical' ? verticalMenu() : menu()}
        color={
          variant === 'filled' || variant === 'vertical'
            ? theme.colors.white
            : theme.colors.base
        }
        {...iconProps}
      />
    </TouchableOpacity>
  );
}

export default MenuButton;
