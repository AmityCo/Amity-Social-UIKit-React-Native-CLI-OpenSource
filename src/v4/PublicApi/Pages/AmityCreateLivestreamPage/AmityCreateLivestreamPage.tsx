import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
  ImageStyle,
  Linking,
} from 'react-native';
import { useStyles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import useImagePicker from '../../../../social/hooks/useImagePicker';
import { arrowDown, close } from '../../../../core/assets/icons';
import { SvgXml } from 'react-native-svg';
import { Typography } from '../../../component/Typography/Typography';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';
import { useBottomSheet } from '../../../../core/stores/slices/bottomSheetSlice';
import { CircularProgressIndicator } from '../../../component/CircularProgressIndicator';
import { RootStackParamList } from '../../../../core/routes/RouteParamList';
import { PostRepository, RoomRepository } from '@amityco/ts-sdk-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../../../component/Button/Button';
import { useRequestPermission } from '../../../../social/hooks/useCamera';
import NetInfo from '@react-native-community/netinfo';
import { RoomStatus } from '../../../../social/enums/roomStatus';
import { AmityThumbnailActionComponent } from '../../Components/AmityThumbnailActionComponent';
import { StartLivestreamButton } from '../../../elements/StartLivestreamButton';
import { PageID } from '../../../../social/enums';
import { LiveTimerStatus } from '../../../elements/LiveTimerStatus';
import { CancelCreateLivestreamButton } from '../../../elements/CancelCreateLivestreamButton';
import { EndLiveStreamButton } from '../../../elements/EndLiveStreamButton';
import { AddThumbnailButton } from '../../../elements/AddThumbnailButton';
import { SwitchCameraButton } from '../../../elements/SwitchCameraButton';
import { Track, LocalVideoTrack } from 'livekit-client';
import { LiveKitRoom, registerGlobals } from '@livekit/react-native';
import { RoomView } from './RoomView';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useRoomSubscription } from '../../../../social/hooks/useRoomSubscription';
import { useToast } from '../../../../core/stores/slices/toastSlice';
import { usePostSubscription } from '../../../../social/hooks';
import { useRoom } from '../../../../social/features/room/hooks/useRoom';

// Register WebRTC globals required for LiveKit
registerGlobals();

const serverUrl = 'wss://sp-live-3tr59jrk.livekit.cloud';

const calculateTime = (time: number) => {
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor(time / 60000);
  const seconds = ((time % 60000) / 1000).toFixed(0);

  const hoursString = `${hours < 10 ? '0' : ''}${hours}`;
  const minutesString = `${minutes < 10 ? '0' : ''}${minutes}`;
  const secondsString = `${Number(seconds) < 10 ? '0' : ''}${seconds}`;

  return `${
    hours > 0 ? hoursString + ':' : ''
  }${minutesString}:${secondsString}`;
};

function AmityCreateLivestreamPage() {
  const styles = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme<MyMD3Theme>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateLivestream'>>();

  const [time, setTime] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [post, setPost] = useState<Amity.Post | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const timerRef = useRef<number | null>(null);
  const connectionLossTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [androidPermission, setAndroidPermission] = useState<boolean>(false);
  const [iOSPermission, setIOSPermission] = useState<boolean>(true);
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  const [livekitParticipant, setLivekitParticipant] = useState<any>(null);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(true);
  const [roomToken, setRoomToken] = useState<Amity.BroadcasterData | null>(
    null
  );
  const unsubscribeRef = useRef<Amity.Unsubscriber>(null);

  const room = useRoom(roomId);

  useRoomSubscription({ room });

  const { subscribedPost } = usePostSubscription(post?.postId || '');

  const { showToast } = useToast();

  const frontCamera = useCameraDevice('front');
  const backCamera = useCameraDevice('back');
  const cameraDevice = isFrontCamera ? frontCamera : backCamera;

  const {
    imageUri,
    isLoading,
    progress,
    uploadedImage,
    removeSelectedImage,
    openImageGallery,
  } = useImagePicker();

  const { targetId, targetType, targetName, pop } = route.params;
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();
  const disabled = !title?.trim() || isConnecting || isLoading;
  const hasPermission =
    (Platform.OS === 'android' && androidPermission) ||
    (Platform.OS === 'ios' && iOSPermission);

  const fourHours = 4 * 60 * 60 * 1000; // 4 hours
  const countdownStart = fourHours - 10 * 1000; // Start countdown 10 seconds before end
  const toastTriggerTime = fourHours - 3 * 60 * 1000; // Show toast 3 minutes before end

  const switchCamera = useCallback(async () => {
    if (isLive && livekitParticipant) {
      try {
        const cameraPublication = livekitParticipant.getTrackPublication(
          Track.Source.Camera
        );

        if (cameraPublication?.track) {
          const videoTrack = cameraPublication.track as LocalVideoTrack;

          // Stop current camera
          await videoTrack.stop();

          // Get new facing mode
          const newFacingMode = isFrontCamera ? 'environment' : 'user';

          // Restart camera with new facing mode
          await videoTrack.restartTrack({
            facingMode: newFacingMode,
          });

          // Toggle the camera state
          setIsFrontCamera((prev) => !prev);
        }
      } catch (error) {
        console.error('Failed to switch camera:', error);
      }
    } else {
      // Just toggle the camera state for preview
      setIsFrontCamera((prev) => !prev);
    }
  }, [livekitParticipant, isFrontCamera, isLive]);

  useRequestPermission({
    shouldCall: Platform.OS === 'ios',
    onRequestPermissionFailed: (callback?: () => void) => {
      setTimeout(() => {
        callback && callback();
        setIOSPermission(false);
      }, 700);
    },
  });

  const checkPermissionAndroid = useCallback(async () => {
    try {
      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: `App Would Like to Access the Camera`,
          message:
            'Allow camera access so you can take pictures, record video and share live streams to your community.',
          buttonNegative: "Don't Allow",
          buttonPositive: 'Allow',
        }
      );

      const microphonePermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: `App Would Like to Access the Microphone`,
          message:
            'Allow camera access so you can take pictures, record video and share live streams to your community.',
          buttonNegative: "Don't Allow",
          buttonPositive: 'Allow',
        }
      );

      if (
        cameraPermission !== PermissionsAndroid.RESULTS.GRANTED ||
        microphonePermission !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        setAndroidPermission(false);
      }

      if (
        cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
        microphonePermission === PermissionsAndroid.RESULTS.GRANTED
      )
        setAndroidPermission(true);
    } catch (err) {
      console.warn(err);
    }
  }, []);

  const onGoLive = async () => {
    try {
      setIsLive(true);
      setIsConnecting(true);

      const { data: newStream } = await RoomRepository.createRoom({
        title,
        description: description || undefined,
        thumbnailFileId: uploadedImage?.fileId,
        type: 'coHosts',
      });

      setRoomId(newStream.roomId);

      if (newStream) {
        const roomTokenResponse = await RoomRepository.getBroadcasterData(
          newStream.roomId
        );

        setRoomToken(roomTokenResponse);

        const params = {
          targetId,
          targetType,
          dataType: 'room' as Amity.PostContentType,
          data: {
            text: `${newStream.title}${
              newStream.description ? `\n\n${newStream.description}` : ''
            }`,
            roomId: newStream.roomId,
          },
        };

        const newPost = await PostRepository.createPost(params);

        setPost(newPost.data);

        // Set isConnecting to false since LiveKit room is already connected
        setIsConnecting(false);

        // Start the timer when live stream actually starts
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        const intervalId = setInterval(() => {
          setTime((prev) => prev + 1000);
        }, 1000);

        timerRef.current = intervalId;
      }
    } catch (error) {
      console.log('startLiveStream error', error);
      setIsLive(false);
      setIsConnecting(false);
      Alert.alert(
        'Cannot start live stream',
        'Something went wrong while trying to complete your request. Please try again.',
        [
          {
            text: 'OK',
          },
        ]
      );
    }
  };

  const confirmEndStreamAlert = () => {
    Alert.alert(
      'End live stream?',
      'If you end your live stream, it will also end for all your viewers.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          style: 'destructive',
          text: 'End',
          onPress: () => {
            endLiveStream();
          },
        },
      ]
    );
  };

  const endLiveStream = useCallback(
    async (showEndPopup = false) => {
      if (room) {
        setIsEnding(true);
        try {
          await RoomRepository.stopRoom(room.roomId);
        } catch (e) {
          console.log('disposeStream error', e);
        } finally {
          setIsLive(false);
          setRoomId('');
          setTitle('');
          setDescription('');
          setTime(0);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsEnding(false);
          setReconnecting(false);

          navigation.navigate('PostDetail', {
            postId: post?.postId,
            showEndPopup,
          });
        }
      }
    },
    [post, room, navigation]
  );

  useEffect(() => {
    // Show toast when 3 minutes left
    if (room && time >= toastTriggerTime && time < toastTriggerTime + 1000) {
      showToast({
        type: 'informative',
        message:
          'Your live will automatically end once it reaches 4-hour limit.',
        duration: 3000,
        bottomPosition: 96,
      });
    }

    if (room && time >= fourHours) {
      endLiveStream(true);
      setCountdown(null);
    } else if (room && time >= countdownStart && time < fourHours) {
      // Calculate countdown from 10 to 0
      const remaining = Math.ceil((fourHours - time) / 1000);
      setCountdown(remaining);
    } else {
      setCountdown(null);
    }
  }, [
    endLiveStream,
    room,
    time,
    showToast,
    toastTriggerTime,
    fourHours,
    countdownStart,
  ]);

  useEffect(() => {
    if (Platform.OS === 'android') checkPermissionAndroid();
  }, [checkPermissionAndroid]);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      setReconnecting(!state.isConnected);
    });

    let unsubscribe = NetInfo.addEventListener((state) => {
      setReconnecting(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (reconnecting && room?.status === RoomStatus.live) {
      connectionLossTimeoutRef.current = setTimeout(() => {
        endLiveStream();
      }, 1000 * 60 * 3);
    } else {
      if (connectionLossTimeoutRef.current) {
        clearTimeout(connectionLossTimeoutRef.current);
        connectionLossTimeoutRef.current = null;
      }
    }

    return () => {
      if (connectionLossTimeoutRef.current) {
        clearTimeout(connectionLossTimeoutRef.current);
        connectionLossTimeoutRef.current = null;
      }
    };
  }, [reconnecting, endLiveStream, room?.status]);

  useEffect(() => {
    if (room?.status === RoomStatus.terminated) {
      navigation.replace('LivestreamTerminated', { type: 'streamer' });
    }
  }, [room?.status, navigation]);

  useEffect(() => {
    if (room?.isDeleted || subscribedPost?.isDeleted) {
      navigation.replace('PostDetail', { postId: subscribedPost?.postId });
    }
  }, [
    navigation,
    room?.isDeleted,
    subscribedPost?.postId,
    subscribedPost?.isDeleted,
  ]);

  useEffect(() => {
    const unsubscribe = unsubscribeRef.current;

    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {(!isLive ||
        (isLive && isConnecting) ||
        (isLive && reconnecting && !isEnding) ||
        isEnding) && (
        <View
          style={[styles.overlay, !hasPermission && styles.noPermissionOverlay]}
        />
      )}

      {/* Preview camera part */}

      {hasPermission ? (
        roomToken ? (
          <LiveKitRoom
            serverUrl={serverUrl}
            token={roomToken.coHostToken}
            connect={true}
            options={{
              adaptiveStream: { pixelDensity: 'screen' },
            }}
            audio={{
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }}
            video={{
              facingMode: isFrontCamera ? 'user' : 'environment',
            }}
            onConnected={() => {
              setIsConnecting(false);
              setReconnecting(false);
            }}
            onDisconnected={() => {
              setReconnecting(true);
            }}
          >
            <View style={styles.cameraContainer}>
              <View style={styles.camera}>
                <RoomView
                  onLocalParticipantReady={setLivekitParticipant}
                  isFrontCamera={isFrontCamera}
                />
              </View>
            </View>
          </LiveKitRoom>
        ) : (
          <View style={styles.cameraContainer}>
            <View style={styles.camera}>
              {cameraDevice && (
                <Camera
                  style={{ flex: 1 }}
                  device={cameraDevice}
                  isActive={true}
                />
              )}
            </View>
          </View>
        )
      ) : (
        <View style={styles.permission}>
          <Typography.TitleBold style={styles.permissionTitle}>
            Allow access to your {'\n'} camera and microphone
          </Typography.TitleBold>
          <Typography.Body style={styles.permissionDescription}>
            This lets you record and live stream {'\n'} from this device.
          </Typography.Body>
          <Button
            type="primary"
            themeStyle={theme}
            onPress={() => Linking.openSettings()}
          >
            <Typography.BodyBold style={styles.text}>
              Open settings
            </Typography.BodyBold>
          </Button>
        </View>
      )}

      {isEnding && (
        <View style={styles.connecting}>
          <CircularProgressIndicator size={40} strokeWidth={2} />
          <Typography.TitleBold style={styles.text}>
            Ending live stream
          </Typography.TitleBold>
        </View>
      )}
      {isLive ? (
        isConnecting ? (
          <View style={styles.connecting}>
            <CircularProgressIndicator size={40} strokeWidth={2} />
            <Typography.TitleBold style={styles.text}>
              Starting live stream
            </Typography.TitleBold>
          </View>
        ) : (
          <>
            {!isEnding && reconnecting && (
              <View style={styles.connecting}>
                <CircularProgressIndicator size={40} strokeWidth={2} />
                <Typography.TitleBold style={styles.text}>
                  Reconnecting
                </Typography.TitleBold>
                <Typography.Caption style={styles.reconnectingText}>
                  Due to poor connection, this live stream has been {'\n'}{' '}
                  paused. It will resume automatically {'\n'} once the
                  connection is stable.
                </Typography.Caption>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => confirmEndStreamAlert()}
            >
              <SvgXml
                xml={close()}
                width="28"
                height="28"
                color={theme.colors.background}
              />
            </TouchableOpacity>

            <View style={styles.timer}>
              <LiveTimerStatus
                time={calculateTime(time)}
                pageId={PageID.create_livestream_page}
              />
            </View>
            {countdown !== null && (
              <View style={styles.countdownOverlay}>
                <View style={styles.countdownContainer}>
                  <Typography.TitleBold style={styles.countdownText}>
                    Live stream ends in
                  </Typography.TitleBold>
                  <View style={styles.countdownCircle}>
                    <CircularProgressIndicator
                      size={64}
                      strokeWidth={2}
                      progress={((10 - countdown) / 10) * 100}
                    />
                    <View style={styles.countdownNumberContainer}>
                      <Typography style={styles.countdownNumber}>
                        {countdown}
                      </Typography>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </>
        )
      ) : (
        <View style={styles.content}>
          <View>
            <View style={styles.header}>
              <CancelCreateLivestreamButton
                pageId={PageID.create_livestream_page}
                onPress={() => {
                  if (title?.trim())
                    return Alert.alert(
                      'Unsaved changes',
                      'Are you sure you want to discard the changes? They will be lost when you leave this page.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Discard',
                          style: 'destructive',
                          onPress: () => {
                            navigation.goBack();
                            if (pop === 2) navigation.goBack();
                          },
                        },
                      ]
                    );
                  navigation.goBack();
                  if (pop === 2) navigation.goBack();
                }}
              />
              <TouchableOpacity
                style={styles.communityButton}
                onPress={() => {
                  const state = navigation.getState();
                  const routes = state.routes;
                  const currentIndex = state.index;
                  const previousRoute = routes[currentIndex - 1];

                  if (previousRoute?.name === 'LivestreamPostTargetSelection') {
                    navigation.goBack();
                  } else {
                    return;
                  }
                }}
                activeOpacity={0.7}
              >
                <Typography.Body
                  style={styles.communityName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Live on{' '}
                  <Typography.BodyBold
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.communityName}
                  >
                    {targetName}
                  </Typography.BodyBold>
                </Typography.Body>
                <View>
                  <SvgXml
                    xml={arrowDown()}
                    width={16}
                    height={16}
                    color={theme.colors.background}
                  />
                </View>
              </TouchableOpacity>
            </View>
            {hasPermission && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Add live stream title..."
                  numberOfLines={1}
                  maxLength={30}
                  placeholderTextColor={'rgba(255, 255, 255, 0.8)'}
                  onChangeText={(text) => setTitle(text)}
                  value={title}
                />
                <TextInput
                  style={styles.descriptionInput}
                  multiline
                  scrollEnabled
                  blurOnSubmit={true}
                  placeholder="Add description (optional)"
                  placeholderTextColor={'rgba(255, 255, 255, 0.8)'}
                  onChangeText={(text) => setDescription(text)}
                  value={description}
                />
              </View>
            )}
          </View>
          <View style={styles.goLiveContainer}>
            <StartLivestreamButton
              onPress={onGoLive}
              disabled={disabled}
              pageId={PageID.create_livestream_page}
            />
          </View>
        </View>
      )}
      <View style={styles.footer}>
        {isLive && !isConnecting && (
          <EndLiveStreamButton
            onPress={confirmEndStreamAlert}
            pageId={PageID.create_livestream_page}
          />
        )}
        {isLive && isConnecting && <View />}
        {!isLive && (
          <>
            {imageUri || uploadedImage ? (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.thumbnailButton}
                onPress={() => {
                  openBottomSheet({
                    height: 200,
                    content: (
                      <AmityThumbnailActionComponent
                        onChangeThumbnail={() => {
                          closeBottomSheet();
                          openImageGallery({
                            selectionLimit: 1,
                            mediaType: 'photo',
                            includeBase64: false,
                          });
                        }}
                        onDeleteThumbnail={() => {
                          closeBottomSheet();
                          removeSelectedImage();
                        }}
                      />
                    ),
                  });
                }}
              >
                <View style={styles.thumbnailImageContainer}>
                  <Image
                    source={{ uri: uploadedImage?.fileUrl || imageUri }}
                    style={styles.thumbnailImage as ImageStyle}
                  />
                  {isLoading && (
                    <View style={styles.thumbnailLoader}>
                      <CircularProgressIndicator
                        size={24}
                        strokeWidth={2}
                        progress={progress}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ) : (
              <AddThumbnailButton
                onPress={() =>
                  openImageGallery({
                    selectionLimit: 1,
                    mediaType: 'photo',
                    includeBase64: false,
                  })
                }
                pageId={PageID.create_livestream_page}
              />
            )}
          </>
        )}
        <SwitchCameraButton
          pageId={PageID.create_livestream_page}
          onPress={switchCamera}
        />
      </View>
    </SafeAreaView>
  );
}

export default AmityCreateLivestreamPage;
