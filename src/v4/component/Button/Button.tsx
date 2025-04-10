import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';

import { Typography } from '../Typography/Typography';
import { useStyles } from './styles';

export type ButtonProps = TouchableOpacityProps & {
  iconStyle?: StyleProp<ViewStyle>;
  size?: 'small' | 'large';
  type?: 'primary' | 'secondary' | 'inverse';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const Button = ({
  icon,
  children,
  style,
  iconStyle,
  size = 'large',
  type = 'primary',
  textStyle,
  ...props
}: ButtonProps) => {
  const styles = useStyles();
  // Determine which styles to apply based on props
  const buttonStyles = [
    styles.button,
    styles[`button${capitalize(type)}`],
    styles[`button${capitalize(size)}`],
    style,
  ];

  const iconStyles = [styles.icon, iconStyle];

  const renderText = useCallback(() => {
    if (size === 'small') {
      return (
        <Typography.CaptionBold style={textStyle}>
          {children}
        </Typography.CaptionBold>
      );
    }

    return (
      <Typography.BodyBold style={textStyle}>{children}</Typography.BodyBold>
    );
  }, [size, children, textStyle]);

  return (
    <TouchableOpacity
      {...props}
      style={buttonStyles}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      {icon && React.isValidElement(icon)
        ? React.cloneElement(icon, {
            style: [
              ...(icon.props.style ? [icon.props.style] : []),
              ...iconStyles,
            ],
          } as React.ReactElement['props'])
        : null}

      {children && typeof children === 'string' ? renderText() : children}
    </TouchableOpacity>
  );
};

// Helper function to capitalize first letter
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default Button;
