import React from 'react';
import { SvgXml } from 'react-native-svg';
import { View, ViewProps } from 'react-native';
import { Typography } from '../Typography/Typography';
import { useStyles } from './styles';
import emptyList from '~/v4/assets/icons/emptyList';

type EmptyListProps = ViewProps;

function EmptyList(props: EmptyListProps) {
  const { styles, theme } = useStyles();

  return (
    <View {...props} style={[styles.container, props.style]}>
      <SvgXml
        xml={emptyList()}
        width={60}
        height={60}
        color={theme.colors.secondaryShade4}
      />
      <Typography.TitleBold style={styles.text}>
        No users available
      </Typography.TitleBold>
    </View>
  );
}

export default EmptyList;
