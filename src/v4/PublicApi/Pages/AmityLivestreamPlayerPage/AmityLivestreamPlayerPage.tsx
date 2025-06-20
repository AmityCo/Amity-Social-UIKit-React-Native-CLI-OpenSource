import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useAnimatedValue,
} from 'react-native';
import { useStyles } from './styles';
import { AmityStreamPlayer } from '@amityco/video-player-react-native';
import LiveStreamEndThumbnail from '../../../component/LivestreamContent/LivestreamEndedThumbnail';
import { Animated } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  getPostTopic,
  PostRepository,
  StreamRepository,
  subscribeTopic,
} from '@amityco/ts-sdk-react-native';
import { close, pause, resume } from '../../../assets/icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { LivestreamStatus } from '../../../enum/livestreamStatus';
import LiveStreamIdleThumbnail from '../../../component/LivestreamContent/LivestreamIdleThumbnail';
import { Typography } from '../../../component/Typography/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { CircularProgressIndicator } from '../../../component/CircularProgressIndicator';
const usePostSubscription = (postId: string) => {
  const [subscribedPost, setSubscribedPost] = useState<Amity.Post>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    if (postId) {
      unsubscribe = PostRepository.getPost(postId, ({ data }) => {
        setSubscribedPost(data);
      });
    }
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [postId]);

  useEffect(() => {
    let unsubscribe: () => void;
    if (subscribedPost) {
      unsubscribe = subscribeTopic(getPostTopic(subscribedPost));
    }
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [subscribedPost]);

  return { subscribedPost };
};

function AmityLiveStreamPlayerPage() {
  const ref = useRef<any>(null);
  const { styles, theme } = useStyles();
  const controlOpacity = useAnimatedValue(0);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'LivestreamPlayer'>>();

  const [error, setError] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [livestream, setLivestream] = useState<Amity.Stream>();

  const { streamId, post } = route.params;

  const { subscribedPost } = usePostSubscription(post?.postId);

  const onStopPlayer = () => {
    ref.current && ref.current.pause();
    setIsPlaying(false);
  };

  const onStartPlayer = () => {
    ref.current && ref.current.play();
    setIsPlaying(true);
  };

  const onPressControlButton = () => {
    isPlaying ? onStopPlayer() : onStartPlayer();
  };

  const onToggleControl = () => {
    controlOpacity.stopAnimation((currentValue) => {
      Animated.timing(controlOpacity, {
        toValue: currentValue === 0 ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  useEffect(() => {
    const unsubscribe = StreamRepository.getStreamById(
      streamId,
      ({ data, loading, error: streamError }) => {
        if (streamError) setError(streamError);
        if (!loading && data) setLivestream({ ...data });
      }
    );

    return () => unsubscribe();
  }, [streamId]);

  useEffect(() => {
    if (livestream?.isDeleted || subscribedPost?.isDeleted) {
      navigation.replace('PostDetail', { postId: subscribedPost?.postId });
    }
  }, [livestream?.isDeleted, subscribedPost, navigation]);

  useEffect(() => {
    const isTerminated =
      livestream?.moderation?.terminateLabels &&
      livestream?.moderation?.terminateLabels?.length > 0;
    const isLiveOrEnded =
      livestream?.status === LivestreamStatus.live ||
      livestream?.status === LivestreamStatus.ended;

    if (isLiveOrEnded && isTerminated) {
      navigation.replace('LivestreamTerminated', { type: 'viewer' });
    }
  }, [livestream?.moderation?.terminateLabels, livestream?.status, navigation]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setReconnecting(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  if (!livestream || error)
    return (
      <SafeAreaView style={styles.container}>
        <LiveStreamIdleThumbnail />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      {livestream.status === LivestreamStatus.ended ? (
        <>
          <View style={styles.steamEndContainer}>
            <LiveStreamEndThumbnail />
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={navigation.goBack}
          >
            <SvgXml
              xml={close()}
              width="28"
              height="28"
              color={theme.colors.background}
            />
          </TouchableOpacity>
        </>
      ) : (
        <AmityStreamPlayer
          ref={ref}
          stream={livestream}
          onBack={navigation.goBack}
          status={livestream.status === 'live' ? 'live' : 'recorded'}
        />
      )}
      {livestream.status === LivestreamStatus.live && reconnecting && (
        <View style={styles.connecting}>
          <CircularProgressIndicator size={40} strokeWidth={2} />
          <Typography.TitleBold style={styles.text}>
            Reconnecting
          </Typography.TitleBold>
          <Typography.Caption style={styles.reconnectingText}>
            Due to poor connection, this live stream has been {'\n'} paused. It
            will resume automatically {'\n'} once the connection is stable.
          </Typography.Caption>
        </View>
      )}
      {livestream.status === LivestreamStatus.live && (
        <>
          <View style={styles.indicator}>
            <View style={styles.status}>
              <Typography.CaptionBold style={styles.live}>
                LIVE
              </Typography.CaptionBold>
            </View>
          </View>
          <TouchableWithoutFeedback onPress={onToggleControl}>
            <Animated.View
              style={[styles.control, { opacity: controlOpacity }]}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={navigation.goBack}
              >
                <SvgXml
                  xml={close()}
                  width="28"
                  height="28"
                  color={theme.colors.background}
                />
              </TouchableOpacity>

              <View style={styles.controller}>
                <TouchableOpacity onPress={onPressControlButton}>
                  {isPlaying ? (
                    <SvgXml
                      width={32}
                      height={32}
                      xml={pause()}
                      color={theme.colors.background}
                    />
                  ) : (
                    <SvgXml
                      width={32}
                      height={32}
                      xml={resume()}
                      color={theme.colors.background}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </>
      )}
    </SafeAreaView>
  );
}

export default AmityLiveStreamPlayerPage;
