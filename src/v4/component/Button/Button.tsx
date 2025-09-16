import React from 'react';
import {
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';

import { Typography } from '../Typography/Typography';
import { useStyles } from './styles';
import { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';
import { SvgXml, XmlProps } from 'react-native-svg';

export const enum BUTTON_SIZE {
  SMALL = 'small',
  LARGE = 'large',
}

export type ButtonProps = TouchableOpacityProps & {
  iconProps?: XmlProps;
  size?: BUTTON_SIZE;
  type?: 'primary' | 'secondary' | 'inverse' | 'inline';
  icon?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  themeStyle?: MyMD3Theme;
};

export const Button = ({
  icon,
  children,
  style,
  iconProps,
  size = BUTTON_SIZE.LARGE,
  type = 'primary',
  textStyle,
  themeStyle,
  disabled,
  ...props
}: ButtonProps) => {
  const styles = useStyles(themeStyle);

  const buttonStyles =
    type === 'inline'
      ? [
          styles[`button${capitalize(type)}`],
          disabled && styles[`button${capitalize(type)}Disabled`],
          style,
        ]
      : [
          styles.button,
          styles[`button${capitalize(type)}`],
          styles[`button${capitalize(size)}`],
          icon && children ? styles[`${size}WithIcon`] : null,
          icon && !children ? styles[`${size}OnlyIcon`] : null,
          disabled && styles[`button${capitalize(type)}Disabled`],
          style,
        ];

  const textStyles = [styles[`text${capitalize(type)}`], textStyle];

  const iconColor = {
    primary: themeStyle?.colors.background,
    secondary: themeStyle?.colors.secondary,
  };

  const renderChildren = () => {
    if (!children) return null;

    if (typeof children !== 'string') return children;

    if (type === 'inline')
      return <Typography.Body style={buttonStyles}>{children}</Typography.Body>;

    if (size === 'small') {
      return (
        <Typography.CaptionBold style={textStyles}>
          {children}
        </Typography.CaptionBold>
      );
    }

    return (
      <Typography.BodyBold style={textStyles}>{children}</Typography.BodyBold>
    );
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled}
      style={buttonStyles}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      {icon && (
        <SvgXml
          xml={icon}
          width={20}
          height={20}
          color={iconColor[type]}
          {...iconProps}
        />
      )}
      {renderChildren()}
    </TouchableOpacity>
  );
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default Button;
