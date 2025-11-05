import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useStyles } from './styles';
import LiveStreamEndThumbnail from '../../../component/LivestreamContent/LivestreamEndedThumbnail';
import { SvgXml } from 'react-native-svg';
import {
  getPostTopic,
  PostRepository,
  RoomRepository,
  subscribeTopic,
} from '@amityco/ts-sdk-react-native';
import { close } from '../../../assets/icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { LivestreamStatus } from '../../../enum/livestreamStatus';
import LiveStreamIdleThumbnail from '../../../component/LivestreamContent/LivestreamIdleThumbnail';
import { Typography } from '../../../component/Typography/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { CircularProgressIndicator } from '../../../component/CircularProgressIndicator';
import VideoPlayer from 'react-native-video-controls';

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
  const { styles, theme } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'LivestreamPlayer'>>();

  const [reconnecting, setReconnecting] = useState(false);
  const [room, setRoom] = useState<Amity.Room | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { roomId, post } = route.params;

  const { subscribedPost } = usePostSubscription(post?.postId);

  useEffect(() => {
    const unsubscribe = RoomRepository.getRoom(
      roomId,
      ({ data, loading, error: streamError }) => {
        if (streamError) setError(streamError);
        if (!loading && data) setRoom({ ...data });
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (room?.isDeleted || subscribedPost?.isDeleted) {
      navigation.replace('PostDetail', { postId: subscribedPost?.postId });
    }
  }, [room?.isDeleted, subscribedPost, navigation]);

  useEffect(() => {
    const isTerminated =
      room?.moderation?.terminateLabels &&
      room?.moderation?.terminateLabels?.length > 0;
    const isLiveOrEnded =
      room?.status === LivestreamStatus.live ||
      room?.status === LivestreamStatus.ended;

    if (isLiveOrEnded && isTerminated) {
      navigation.replace('LivestreamTerminated', { type: 'viewer' });
    }
  }, [room?.moderation?.terminateLabels, room?.status, navigation]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setReconnecting(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  if (!room || error) {
    console.log('livestream error =>', room, error);

    return (
      <SafeAreaView style={styles.container}>
        <LiveStreamIdleThumbnail />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {room.status === LivestreamStatus.ended ? (
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
        <View style={styles.container}>
          <VideoPlayer
            source={{
              uri: room.livePlaybackUrl,
            }}
            style={styles.container}
            resizeMode="contain"
            onBack={navigation.goBack}
            controlAnimationTiming={300}
            toggleResizeModeOnFullscreen={false}
            tapAnywhereToPause={false}
            disableVolume={false}
            disableFullscreen={true}
            showOnStart={true}
            paused={false}
          />
        </View>
      )}
      {room.status === LivestreamStatus.live && reconnecting && (
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
      {room.status === LivestreamStatus.live && (
        <View style={styles.indicator}>
          <View style={styles.status}>
            <Typography.CaptionBold style={styles.live}>
              LIVE
            </Typography.CaptionBold>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default AmityLiveStreamPlayerPage;
