import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  TextInput,
  TouchableOpacity,
  Linking,
  View,
} from 'react-native';
import { useStyles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AmityStreamBroadcasterState,
  AmityVideoBroadcaster,
} from '@amityco/video-broadcaster-react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import useImagePicker from '../../../../v4/hook/useImagePicker';
import { arrowDown } from '../../../../v4/assets/icons';
import { SvgXml } from 'react-native-svg';
import { Typography } from '../../../../v4/component/Typography/Typography';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';
import bottomSheetSlice from '../../../../redux/slices/bottomSheetSlice';
import { useDispatch } from 'react-redux';
import { CircularProgressIndicator } from '../../../../v4/component/CircularProgressIndicator';
import { RootStackParamList } from '../../../../v4/routes/RouteParamList';
import { PostRepository, StreamRepository } from '@amityco/ts-sdk-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../../../../v4/component/Button/Button';
import { useRequestPermission } from '../../../../v4/hook/useCamera';
import NetInfo from '@react-native-community/netinfo';
import { LivestreamStatus } from '../../../enum/livestreamStatus';
import { AmityThumbnailActionComponent } from '../../Components/AmityThumbnailActionComponent';
import { StartLivestreamButton } from '../../../elements/StartLivestreamButton';
import { PageID } from '../../../enum';
import { LiveTimerStatus } from '../../../elements/LiveTimerStatus';
import { CancelCreateLivestreamButton } from '../../../elements/CancelCreateLivestreamButton';
import { EndLiveStreamButton } from '../../../elements/EndLiveStreamButton';
import { AddThumbnailButton } from '../../../elements/AddThumbnailButton';
import { SwitchCameraButton } from '../../../elements/SwitchCameraButton';

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
  const streamRef = useRef<any>(null);
  const dispatch = useDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme<MyMD3Theme>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateLivestream'>>();

  const [time, setTime] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [post, setPost] = useState<Amity.Post | null>(null);
  const [stream, setStream] = useState<Amity.Stream | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [androidPermission, setAndroidPermission] = useState<boolean>(false);
  const [iOSPermission, setIOSPermission] = useState<boolean>(true);
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  const unsubscribeRef = useRef<Amity.Unsubscriber>(null);

  const {
    imageUri,
    isLoading,
    progress,
    uploadedImage,
    removeSelectedImage,
    openImageGallery,
  } = useImagePicker({
    selectionLimit: 1,
    mediaType: 'photo',
    includeBase64: false,
  });

  const { targetId, targetType, targetName, pop } = route.params;
  const { closeBottomSheet, openBottomSheet } = bottomSheetSlice.actions;
  const disabled = !title?.trim() || isConnecting || isLoading;
  const hasPermission =
    (Platform.OS === 'android' && androidPermission) ||
    (Platform.OS === 'ios' && iOSPermission);

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

      const { data: newStream } = await StreamRepository.createStream({
        title,
        description: description || undefined,
        thumbnailFileId: uploadedImage?.fileId,
      });

      if (newStream) {
        const params = {
          targetId,
          targetType,
          dataType: 'liveStream' as Amity.PostContentType,
          data: {
            text: `${newStream.title}${
              newStream.description ? `\n\n${newStream.description}` : ''
            }`,
            streamId: newStream.streamId,
          },
        };

        const newPost = await PostRepository.createPost(params);

        streamRef.current = StreamRepository.getStreamById(
          newStream.streamId,
          ({ data }) => {
            setStream(data);
            setPost(newPost.data);
            streamRef?.current?.startPublish(newStream.streamId);
          }
        );
      }
    } catch (error) {
      setIsLive(false);
      setIsConnecting(false);
      Alert.alert(
        'Cannot start live stream',
        'Something went wrong while trying to complete your request.Please try again.',
        [
          {
            text: 'OK',
          },
        ]
      );
    }
  };

  const onBroadcastStateChange = (state: AmityStreamBroadcasterState) => {
    if (state === AmityStreamBroadcasterState.CONNECTED) {
      setIsConnecting(false);
      setReconnecting(false);
      const intervalId = setInterval(() => {
        setTime((prev) => prev + 1000);
      }, 1000);
      setTimer(intervalId);
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
      if (stream) {
        setIsEnding(true);
        try {
          await StreamRepository.disposeStream(stream.streamId);
        } catch (e) {
          console.log('disposeStream error', e);
        } finally {
          streamRef?.current.stopPublish();

          setIsLive(false);
          setStream(null);
          setTitle('');
          setDescription('');
          setTime(0);
          clearInterval(timer);
          setIsEnding(false);
          setReconnecting(false);

          navigation.navigate('PostDetail', {
            postId: post?.postId,
            showEndPopup,
          });
        }
      }
    },
    [post, stream, timer, navigation]
  );

  useEffect(() => {
    const fourHours = 4 * 60 * 60 * 1000;
    if (streamRef.current && stream && time >= fourHours) {
      endLiveStream(true);
    }
  }, [endLiveStream, stream, time]);

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

  useLayoutEffect(() => {
    setTimeout(() => {
      streamRef.current && streamRef.current.switchCamera();
    }, 300);
  }, [streamRef]);

  useEffect(() => {
    let threeMinutesTimeout: number;

    if (reconnecting && stream && stream?.status === 'live') {
      threeMinutesTimeout = setTimeout(() => {
        endLiveStream();
      }, 1000 * 60 * 3);
    }

    if (
      !reconnecting &&
      stream &&
      stream?.status === 'live' &&
      streamRef?.current
    ) {
      streamRef?.current?.startPublish(stream?.streamId);

      if (threeMinutesTimeout) {
        clearTimeout(threeMinutesTimeout);
        threeMinutesTimeout = null;
      }
    }
  }, [reconnecting, endLiveStream, stream]);

  useEffect(() => {
    const isTerminated =
      stream?.moderation?.terminateLabels &&
      stream?.moderation?.terminateLabels?.length > 0;
    const isLiveOrEnded =
      stream?.status === LivestreamStatus.live ||
      stream?.status === LivestreamStatus.ended;

    if (isLiveOrEnded && isTerminated) {
      navigation.replace('LivestreamTerminated', { type: 'streamer' });
    }
  }, [stream?.moderation?.terminateLabels, stream?.status, navigation]);

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
      {hasPermission ? (
        <View style={styles.cameraContainer}>
          <View style={styles.camera}>
            <AmityVideoBroadcaster
              ref={streamRef}
              bitrate={2 * 1024 * 1024}
              onBroadcastStateChange={onBroadcastStateChange}
              resolution={{ width: 1280, height: 720 }}
            />
          </View>
        </View>
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
            onPress={() => {
              Linking.openSettings();
            }}
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
            <View style={styles.timer}>
              <LiveTimerStatus
                time={calculateTime(time)}
                pageId={PageID.create_livestream_page}
              />
            </View>
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
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Typography.Body
                  style={styles.communityName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Live on{' '}
                  <Typography.BodyBold numberOfLines={1} ellipsizeMode="tail">
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
                  dispatch(
                    openBottomSheet({
                      height: 200,
                      content: (
                        <AmityThumbnailActionComponent
                          onChangeThumbnail={() => {
                            dispatch(closeBottomSheet());
                            openImageGallery();
                          }}
                          onDeleteThumbnail={() => {
                            dispatch(closeBottomSheet());
                            removeSelectedImage();
                          }}
                        />
                      ),
                    })
                  );
                }}
              >
                <View style={styles.thumbnailImageContainer}>
                  <Image
                    source={{ uri: uploadedImage?.fileUrl || imageUri }}
                    style={styles.thumbnailImage}
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
                onPress={openImageGallery}
                pageId={PageID.create_livestream_page}
              />
            )}
          </>
        )}
        <SwitchCameraButton
          pageId={PageID.create_livestream_page}
          onPress={() => {
            streamRef.current && streamRef.current.switchCamera();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export default AmityCreateLivestreamPage;
