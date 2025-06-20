import React from 'react';
import { View } from 'react-native';
import { useStyles } from './styles';
import { Typography } from '../../Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { exclamation } from '../../../assets/icons';

const LiveStreamIdleThumbnail = () => {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.container}>
      <SvgXml
        width={32}
        height={32}
        xml={exclamation()}
        color={theme.colors.background}
      />
      <Typography.TitleBold style={styles.title}>
        This stream is currently unavailable.
      </Typography.TitleBold>
    </View>
  );
};

export default LiveStreamIdleThumbnail;
