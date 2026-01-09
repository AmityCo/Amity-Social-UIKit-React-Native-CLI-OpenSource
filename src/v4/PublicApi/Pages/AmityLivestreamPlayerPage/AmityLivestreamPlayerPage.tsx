import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useStyles } from './styles';
import LiveStreamEndThumbnail from '../../../component/LivestreamContent/LivestreamEndedThumbnail';
import { SvgXml } from 'react-native-svg';
import { RoomRepository } from '@amityco/ts-sdk-react-native';
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
import {
  usePostSubscription,
  useRoomSubscription,
} from '../../../../v4/hook/index';

function AmityLiveStreamPlayerPage() {
  const { styles, theme } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'LivestreamPlayer'>>();

  const [reconnecting, setReconnecting] = useState(false);
  const [room, setRoom] = useState<Amity.Room | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [wasLive, setWasLive] = useState(false);
  const [showEndThumbnail, setShowEndThumbnail] = useState(false);
  const { roomId, post } = route.params;
  const { client } = useAuth();
  const videoRef = useRef<any>(null);
  const isProgrammaticDismiss = useRef(false);

  const { subscribedPost } = usePostSubscription(post?.postId);

  useRoomSubscription({ room });

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

  // Track if user was watching live
  useEffect(() => {
    if (room?.status === RoomStatus.live) {
      setWasLive(true);
    }
  }, [room?.status]);

  // Dismiss fullscreen player when stream ends
  useEffect(() => {
    const shouldShowEndThumbnail =
      room?.status === RoomStatus.ended ||
      (room?.status === RoomStatus.recorded && wasLive);

    console.log('shouldShowEndThumbnail =>', shouldShowEndThumbnail);
    console.log('videoRef.current', videoRef.current);

    if (shouldShowEndThumbnail && videoRef.current) {
      console.log('Dismissing fullscreen player');
      isProgrammaticDismiss.current = true;
      videoRef.current?.dismissFullscreenPlayer();
      // Delay showing end thumbnail to allow fullscreen dismiss to complete
      setTimeout(() => {
        setShowEndThumbnail(true);
      }, 300);
    } else if (shouldShowEndThumbnail && !videoRef.current) {
      // If video ref is already null, show end thumbnail immediately
      setShowEndThumbnail(true);
    } else if (!shouldShowEndThumbnail) {
      setShowEndThumbnail(false);
    }
  }, [room?.status, wasLive]);

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

  const closePlayer = () => {
    navigation.goBack();
  };

  const handleFullscreenDismiss = () => {
    // Only navigate back if user manually dismissed, not programmatically
    if (!isProgrammaticDismiss.current) {
      closePlayer();
    }
    isProgrammaticDismiss.current = false;
  };

  return (
    <SafeAreaView style={styles.container}>
      {showEndThumbnail ? (
        <>
          <View style={styles.steamEndContainer}>
            <LiveStreamEndThumbnail />
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={closePlayer}>
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

              type: 'm3u8',
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
            onFullscreenPlayerDidDismiss={handleFullscreenDismiss}
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
    </SafeAreaView>
  );
}

export default AmityLiveStreamPlayerPage;
