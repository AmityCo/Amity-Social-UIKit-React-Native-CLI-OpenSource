import React, { useEffect, useState, useRef } from 'react';
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
import { RoomStatus } from '../../../enum/roomStatus';
import LiveStreamIdleThumbnail from '../../../component/LivestreamContent/LivestreamIdleThumbnail';
import { Typography } from '../../../component/Typography/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { CircularProgressIndicator } from '../../../component/CircularProgressIndicator';
import Video from 'react-native-video';
import useAuth from '../../../../hooks/useAuth';

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
  const { client } = useAuth();
  const videoRef = useRef<any>(null);

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
      room?.status === RoomStatus.live || room?.status === RoomStatus.ended;

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

  // Start in fullscreen mode on iOS
  useEffect(() => {
    if (videoRef.current && room && room.status !== RoomStatus.ended) {
      const timer = setTimeout(() => {
        videoRef.current?.presentFullscreenPlayer();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [room]);

  if (!room || error) {
    return (
      <SafeAreaView style={styles.container}>
        <LiveStreamIdleThumbnail />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {room.status === RoomStatus.ended ? (
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
          <Video
            ref={videoRef}
            source={{
              uri:
                room.status === RoomStatus.recorded
                  ? room.recordedPlaybackInfos[0]?.url
                  : room.livePlaybackUrl,

              headers: {
                Authorization: `Bearer ${client.token.accessToken}`,
              },
            }}
            style={styles.container}
            resizeMode="contain"
            controls={room.status === RoomStatus.recorded}
            fullscreen={true}
            fullscreenOrientation="landscape"
            paused={false}
            muted={false}
            volume={1.0}
            audioOutput="speaker"
            playInBackground={false}
            playWhenInactive={false}
            onError={(e) => {
              console.log('Video Player Error: ', e);
            }}
            onFullscreenPlayerDidDismiss={() => navigation.goBack()}
          />
        </View>
      )}
      {((room.status === RoomStatus.live && reconnecting) ||
        room.status === RoomStatus.waiting_reconnect) && (
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
      {(room.status === RoomStatus.live ||
        room.status === RoomStatus.waiting_reconnect) && (
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
