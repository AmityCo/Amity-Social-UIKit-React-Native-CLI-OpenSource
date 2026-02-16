import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from './styles';
import { Typography } from '../../../social/components/Typography/Typography';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { warning } from '../../../core/assets/icons';

export function GlobalBan() {
  const { styles, theme } = useStyles();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left']}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Typography.TitleBold style={styles.title}>
            Community
          </Typography.TitleBold>
        </View>
        <View style={styles.contentContainer}>
          <SvgXml
            width={56}
            height={56}
            xml={warning()}
            color={theme.colors.base}
          />
          <Typography.Headline style={styles.title}>
            You've been banned.
          </Typography.Headline>
          <Typography.Body style={styles.body}>
            Based on your previous activities, your account has been banned from
            all feeds.
          </Typography.Body>
        </View>
      </View>
    </SafeAreaView>
  );
}
