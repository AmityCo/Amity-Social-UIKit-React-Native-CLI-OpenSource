import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useStyles } from './styles';
import LiveStreamEndThumbnail from '../../../components/LivestreamContent/LivestreamEndedThumbnail';
import { SvgXml } from 'react-native-svg';
import { close } from '../../../../core/assets/icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../core/routes/RouteParamList';
import { RoomStatus } from '../../../enums/roomStatus';
import LiveStreamIdleThumbnail from '../../../components/LivestreamContent/LivestreamIdleThumbnail';
import { Typography } from '../../../../core/components/Typography/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { CircularProgressIndicator } from '../../../components/CircularProgressIndicator';
import Video from 'react-native-video';
import useAuth from '../../../../core/hooks/useAuth';
import { usePostSubscription, useRoomSubscription } from '../../../hooks/index';
import { RoomRepository } from '@amityco/ts-sdk-react-native';
import { useShareableLink } from '../../../../core/hooks/useShareableLink';
import { ShareableLinkModel } from '../../../types';
import { useBottomSheet } from '../../../../core/stores/slices/bottomSheetSlice';
import MenuButton from '../../../elements/MenuButton/MenuButton';
import { CopyLinkAction } from '../../../elements/CopyLinkAction';
import { ShareAction } from '../../../elements/ShareAction';
import { PageID } from '../../../enums';

function AmityLiveStreamPlayerPage() {
  const { styles, theme } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'LivestreamPlayer'>>();

  const [reconnecting, setReconnecting] = useState(false);
  const [room, setRoom] = useState<Amity.Room | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoKey, setVideoKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [wasLive, setWasLive] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { roomId, post } = route.params;
  const { subscribedPost } = usePostSubscription(post?.postId);

  const { getShareLink } = useShareableLink();
  const { openBottomSheet, bottomSheetHeight } = useBottomSheet();

  const canShare =
    post?.targetType === 'user' ||
    (post?.targetType === 'community' && !!post?.targetCommunity?.isPublic);

  const shareLink = canShare
    ? getShareLink(ShareableLinkModel.livestreams, roomId)
    : null;

  const handleSharePress = () => {
    if (!shareLink) return;
    openBottomSheet({
      dark: true,
      height: bottomSheetHeight[2],
      content: (
        <View>
          <CopyLinkAction
            dark
            link={shareLink}
            pageId={PageID.livestream_player_page}
          />
          <ShareAction
            dark
            link={shareLink}
            pageId={PageID.livestream_player_page}
          />
        </View>
      ),
    });
  };
  useRoomSubscription({ room });

  const { client, isVisitorOrBot } = useAuth();
  const videoRef = useRef<any>(null);
  const isStreamEnding = useRef(false);

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
    if (room?.status === RoomStatus.live) {
      setWasLive(true);
    }
  }, [room?.status]);

  useEffect(() => {
    if (room?.isDeleted || subscribedPost?.isDeleted) {
      navigation.replace('PostDetail', {
        postId: subscribedPost?.postId,
        isDeleted: subscribedPost?.isDeleted,
      });
    }
  }, [
    navigation,
    room?.isDeleted,
    subscribedPost?.postId,
    subscribedPost?.isDeleted,
  ]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setReconnecting(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!room?.status || isVisitorOrBot) return;

    const shouldEnd =
      room.status === RoomStatus.ended ||
      (room.status === RoomStatus.recorded && wasLive);

    if (!shouldEnd || isStreamEnding.current) return;

    isStreamEnding.current = true;
    setIsPaused(true);

    if (Platform.OS === 'ios') {
      // iOS: ONLY dismiss fullscreen. DO NOT touch key. DO NOT unmount.
      requestAnimationFrame(() => {
        videoRef.current?.dismissFullscreenPlayer?.();
      });
    } else {
      // Android: HARD destroy
      setTimeout(() => {
        setVideoKey((prev) => prev + 1);
      }, 50);
    }
  }, [room?.status, wasLive, isVisitorOrBot]);

  useEffect(() => {
    if (isVisitorOrBot) return;
    if (room?.status === RoomStatus.terminated) {
      navigation.replace('LivestreamTerminated', { type: 'viewer' });
    }
  }, [room?.status, navigation, isVisitorOrBot]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    showControlsTemporarily();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [showControlsTemporarily]);

  const shouldShowEndThumbnail =
    !isVisitorOrBot &&
    (room?.status === RoomStatus.ended ||
      (room?.status === RoomStatus.recorded && wasLive) ||
      (room as any)?.user?.isGlobalBan);

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

  const videoUrl =
    room.status === RoomStatus.recorded
      ? room.recordedPlaybackInfos[0]?.url
      : room.livePlaybackUrl;

  return (
    <SafeAreaView style={styles.container}>
      {shouldShowEndThumbnail ? (
        <>
          <View style={styles.steamEndContainer}>
            <LiveStreamEndThumbnail />
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={closePlayer}>
            <SvgXml
              xml={close()}
              width="24"
              height="24"
              color={theme.colors.background}
            />
          </TouchableOpacity>
        </>
      ) : (
        <TouchableWithoutFeedback onPress={showControlsTemporarily}>
          <View style={styles.container}>
            {!shouldShowEndThumbnail && (
              <Video
                key={
                  Platform.OS === 'android'
                    ? `${videoUrl}-${videoKey}`
                    : videoUrl
                }
                ref={videoRef}
                source={{
                  uri:
                    room.status === RoomStatus.recorded
                      ? room.recordedPlaybackInfos[0]?.url
                      : room.livePlaybackUrl,
                  headers: {
                    Authorization: `Bearer ${client?.token?.accessToken}`,
                  },
                  type: 'm3u8',
                }}
                style={styles.container}
                resizeMode="contain"
                controls={false}
                paused={isPaused}
                muted={false}
                volume={1.0}
                audioOutput="speaker"
                playInBackground={false}
                playWhenInactive={false}
                repeat={false}
                onLoad={() => {
                  setIsVideoLoading(false);
                  if (room.status === RoomStatus.recorded) {
                    setIsPaused(false);
                  }
                }}
                onEnd={() => setIsPaused(true)}
              />
            )}

            {(room.status === RoomStatus.live ||
              room.status === RoomStatus.waitingReconnect) && (
              <View style={styles.liveRow}>
                {Platform.OS !== 'android' && (
                  <View style={styles.status}>
                    <Typography.CaptionBold style={styles.live}>
                      LIVE
                    </Typography.CaptionBold>
                  </View>
                )}
                {shareLink && (
                  <MenuButton
                    pageId={PageID.livestream_player_page}
                    variant="vertical"
                    onPress={handleSharePress}
                  />
                )}
              </View>
            )}

            {showControls && (
              <TouchableOpacity
                style={styles.liveCloseButton}
                onPress={closePlayer}
              >
                <SvgXml
                  xml={close()}
                  width="24"
                  height="24"
                  color={theme.colors.background}
                />
              </TouchableOpacity>
            )}

            {isVideoLoading && (
              <View style={styles.connecting}>
                <CircularProgressIndicator size={40} strokeWidth={2} />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      )}

      {((room.status === RoomStatus.live && reconnecting) ||
        room.status === RoomStatus.waitingReconnect) && (
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
