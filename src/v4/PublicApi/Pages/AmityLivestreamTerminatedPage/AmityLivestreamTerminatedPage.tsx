import React from 'react';
import { useStyles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { Typography } from '../../../component/Typography/Typography';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ban, terminated, trash, warning } from '../../../assets/icons';
import Button, { BUTTON_SIZE } from '../../../component/Button/Button';

export function AmityLivestreamTerminatedPage() {
  const { styles, theme } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'LivestreamTerminated'>>();

  const { type } = route.params;
  const isStreamerView = type === 'streamer';

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.header}>
          <Typography.TitleBold style={styles.base}>
            Live terminated
          </Typography.TitleBold>
        </View>
        <View style={styles.content}>
          <SvgXml
            width={56}
            height={56}
            color={theme.colors.base}
            xml={isStreamerView ? warning() : terminated()}
          />
          <Typography.Headline style={[styles.center, styles.base]}>
            {isStreamerView
              ? 'Your live stream has been \nterminated.'
              : 'The live stream has been \nterminated.'}
          </Typography.Headline>
          <Typography.Body style={[styles.center, styles.baseShade1]}>
            {isStreamerView
              ? 'It looks like your live stream goes against our \ncontent moderation guidelines.'
              : " It looks like the live stream you're watching goes \nagainst our content moderation guidelines."}
          </Typography.Body>
        </View>
        <View style={styles.info}>
          <Typography.BodyBold style={[styles.base]}>
            What does it mean?
          </Typography.BodyBold>
          {isStreamerView && (
            <View style={styles.flexRow}>
              <SvgXml
                width={28}
                height={28}
                xml={ban()}
                color={theme.colors.base}
              />
              <View style={styles.textContainer}>
                <Typography.Body style={[styles.base]}>
                  The live stream has also been terminated for all your viewers.
                </Typography.Body>
              </View>
            </View>
          )}
          <View style={styles.flexRow}>
            <SvgXml
              width={28}
              height={28}
              xml={trash()}
              color={theme.colors.base}
            />
            <View style={styles.textContainer}>
              <Typography.Body style={[styles.base]}>
                There will be no playback of this live stream on any feeds.
              </Typography.Body>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          type="primary"
          themeStyle={theme}
          size={BUTTON_SIZE.LARGE}
          onPress={() => navigation.goBack()}
        >
          OK
        </Button>
      </View>
    </SafeAreaView>
  );
}
