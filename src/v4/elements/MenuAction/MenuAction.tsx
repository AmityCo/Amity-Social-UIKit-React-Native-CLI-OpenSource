import React from 'react';
import { SvgXml, XmlProps } from 'react-native-svg';
import { Typography } from '~/v4/component/Typography/Typography';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useStyles } from './styles';

type MenuActionProps = TouchableOpacityProps & {
  label?: string;
  danger?: boolean;
  iconProps?: XmlProps;
};

function MenuAction({ label, danger, iconProps, ...props }: MenuActionProps) {
  const { theme, styles } = useStyles();

  return (
    <TouchableOpacity style={[styles.container, props.style]} {...props}>
      <SvgXml
        width={24}
        height={24}
        color={danger ? theme.colors.alert : theme.colors.base}
        {...iconProps}
      />
      <Typography.BodyBold style={danger ? styles.alert : styles.label}>
        {label}
      </Typography.BodyBold>
    </TouchableOpacity>
  );
}

export default MenuAction;
