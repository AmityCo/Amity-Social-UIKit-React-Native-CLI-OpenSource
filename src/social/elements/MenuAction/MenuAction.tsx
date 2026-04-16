import { SvgXml, XmlProps } from 'react-native-svg';
import { Typography } from '../../../core/components/Typography/Typography';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useStyles } from './styles';

export type MenuActionProps = TouchableOpacityProps & {
  label?: string;
  danger?: boolean;
  dark?: boolean;
  iconProps?: XmlProps;
  gap?: 'small' | 'medium';
};

function MenuAction({
  label,
  danger,
  dark,
  iconProps,
  gap = 'medium',
  ...props
}: MenuActionProps) {
  const { theme, styles } = useStyles({ gap, dark });

  return (
    <TouchableOpacity
      hitSlop={20}
      style={[styles.container, props.style]}
      {...props}
    >
      <SvgXml
        width={24}
        height={24}
        color={
          danger
            ? theme.colors.alert
            : dark
            ? theme.colors.white
            : theme.colors.base
        }
        {...iconProps}
      />
      <Typography.BodyBold style={danger ? styles.alert : styles.label}>
        {label}
      </Typography.BodyBold>
    </TouchableOpacity>
  );
}

export default MenuAction;
