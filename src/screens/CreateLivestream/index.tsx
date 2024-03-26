import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  View,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { closeIcon, editThumbnailIcon, syncIcon } from '../../svg/svg-xml-list';
import { useStyles } from './styles';
import { StreamRepository, PostRepository } from '@amityco/ts-sdk-react-native';
import BottomSheet, { BottomSheetMethods } from '@devvie/bottom-sheet';
import useImagePicker from '../../../src/hooks/useImagePicker';

import { NodePublisher } from 'react-native-nodemediaclient';
import { uploadImageFile } from '../../../src/providers/file-provider';
import { RootStackParamList } from '../../routes/RouteParamList';
import { NavigationProp, RouteProp } from '@react-navigation/native';

interface CreateLivestreamProps {
  navigation: NavigationProp<RootStackParamList, 'CreateLivestream'>;
  route: RouteProp<RootStackParamList, 'CreateLivestream'>;
}

const CreateLivestream = ({ navigation, route }: CreateLivestreamProps) => {
  const { targetId, targetType, targetName } = route.params;

  const styles = useStyles();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [stream, setStream] = useState<Amity.Stream | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [time, setTime] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [post, setPost] = useState<Amity.Post | null>(null);

  const [frontCamera, setFrontCamera] = useState<boolean>(true);

  const streamRef = useRef(null);
  const sheetRef = useRef<BottomSheetMethods>(null);

  const requestPermission = async () => {
    try {
      let granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED)
        return console.log('Camera permission denied');

      granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Record Audio Permission',
          message: 'App needs access to your microphone',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
    } catch (err) {
      console.warn(err);
    }
  };

  const { imageUri, removeSelectedImage, openImageGallery } = useImagePicker({
    selectionLimit: 1,
    mediaType: 'photo',
    includeBase64: false,
  });

  const renderOptionIcon = (icon: string, onClick: () => void) => {
    return (
      <TouchableOpacity style={styles.optionIcon} onPress={onClick}>
        <View style={styles.optionIconInner}>
          <SvgXml xml={icon} width={18} height={18} />
        </View>
      </TouchableOpacity>
    );
  };

  const uploadFile = useCallback(async (uri: string) => {
    const file: Amity.File<any>[] = await uploadImageFile(uri);
    if (file) {
      setFileId(file[0].fileId);
    }
  }, []);

  const createStreamPost = useCallback(
    (newStream: Amity.Stream) => {
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

      return PostRepository.createPost(params);
    },
    [targetId, targetType]
  );

  const onGoLive = useCallback(async () => {
    if (title) {
      setIsConnecting(true);
      setIsLive(true);

      if (imageUri) await uploadFile(imageUri);

      const { data: newStream } = await StreamRepository.createStream({
        title,
        description: description || undefined,
        thumbnailFileId: fileId,
      });

      if (newStream) {
        setStream(newStream);

        const { data: newPost } = await createStreamPost(newStream);
        setPost(newPost);

        streamRef?.current.start();
        onStreamConnectionSuccess();
      }
    } else emptyTitleAlert();
  }, [title, description, imageUri, fileId, uploadFile, createStreamPost]);

  const onStreamConnectionSuccess = () => {
    setIsConnecting(false);
    const intervalId = setInterval(() => {
      setTime((prev) => prev + 1000);
    }, 1000);
    setTimer(intervalId);
  };

  const onStopStream = useCallback(async () => {
    if (stream) {
      setIsEnding(true);
      await StreamRepository.disposeStream(stream.streamId);

      streamRef?.current.stop();
      setIsLive(false);
      setStream(null);
      setTitle(undefined);
      setDescription(undefined);
      setTime(0);
      clearInterval(timer);
      setIsEnding(false);

      navigation.navigate('PostDetail', {
        postId: post.postId,
      });
    }
  }, [stream, timer, post, navigation]);

  const onSwitchCamera = () => {
    setFrontCamera((prev) => !prev);
  };

  const calculateTime = () => {
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

  const emptyTitleAlert = () => {
    Alert.alert('Input Error', 'Title cannot be empty.', [{ text: 'OK' }]);
  };

  const confirmEndStreamAlert = () => {
    Alert.alert('Do you want to end the live stream?', undefined, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'OK', onPress: () => onStopStream() },
    ]);
  };

  useEffect(() => {
    if (Platform.OS === 'android') requestPermission();
  }, []);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.cameraContainer}>
          <NodePublisher
            ref={streamRef}
            style={{ flex: 1 }}
            url={stream?.streamerUrl?.url || ''}
            audioParam={{
              codecid: NodePublisher.NMC_CODEC_ID_AAC,
              profile: NodePublisher.NMC_PROFILE_AUTO,
              samplerate: 48000,
              channels: 1,
              bitrate: 64 * 1000,
            }}
            videoParam={{
              codecid: NodePublisher.NMC_CODEC_ID_H264,
              profile: NodePublisher.NMC_PROFILE_AUTO,
              width: 720,
              height: 1280,
              fps: 30,
              bitrate: 2000 * 1000,
            }}
            frontCamera={frontCamera}
            HWAccelEnable={true}
            denoiseEnable={true}
            torchEnable={false}
            keyFrameInterval={2}
            volume={1.0}
            videoOrientation={NodePublisher.VIDEO_ORIENTATION_PORTRAIT}
          />
          {isEnding ? (
            <View style={styles.endingStreamWrap}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.endingStreamText}>Ending Live Stream</Text>
            </View>
          ) : isLive ? (
            <View style={styles.streamingWrap}>
              <View style={styles.streamingTimerWrap}>
                <Text style={styles.streamingTimer}>
                  {isConnecting ? 'Connecting...' : `LIVE ${calculateTime()}`}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.idleWrap}>
              <View style={styles.idleWraplInner}>
                <View style={styles.optionTopWrap}>
                  {renderOptionIcon(closeIcon('white'), () =>
                    navigation.goBack()
                  )}
                  <View style={styles.optionTopRightWrap}>
                    {renderOptionIcon(syncIcon('white'), onSwitchCamera)}
                    <TouchableOpacity
                      style={styles.optionIcon}
                      onPress={() => {
                        if (imageUri && sheetRef.current)
                          sheetRef.current?.open();
                        else openImageGallery();
                      }}
                    >
                      {imageUri ? (
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.thumbnailImage}
                        />
                      ) : (
                        <View style={styles.optionIconInner}>
                          <SvgXml
                            xml={editThumbnailIcon('#FFFFFF')}
                            width={18}
                            height={18}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.postTarget}>
                  <Image
                    source={require('./../../../assets/icon/Placeholder.png')}
                    style={styles.avatar}
                  />
                  <Text style={styles.targetName}>{targetName}</Text>
                </View>
                <View style={styles.seperator} />
                <View style={styles.detailWrap}>
                  <TextInput
                    style={styles.title}
                    placeholder="Title"
                    placeholderTextColor={'rgba(255, 255, 255, 0.2)'}
                    onChangeText={(text) => setTitle(text)}
                    value={title}
                  />
                  <TextInput
                    style={styles.description}
                    placeholder="Tap to add post description..."
                    placeholderTextColor={'rgba(255, 255, 255, 0.2)'}
                    onChangeText={(text) => setDescription(text)}
                    value={description}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {!isEnding && (
          <View style={styles.footer}>
            {isLive ? (
              <View style={styles.streamingFooter}>
                {renderOptionIcon(syncIcon('white'), onSwitchCamera)}
                <TouchableOpacity
                  style={styles.finishButton}
                  onPress={confirmEndStreamAlert}
                >
                  <Text style={styles.finishButtonText}>Finish</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.goLiveButton} onPress={onGoLive}>
                <Text style={styles.goLiveButtonText}>Go Live</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <BottomSheet
        ref={sheetRef}
        height={164}
        closeOnDragDown={false}
        disableBodyPanning={true}
        disableDragHandlePanning={true}
        customDragHandleComponent={() => null}
      >
        <View style={styles.bottomSheetWrap}>
          <TouchableOpacity
            style={styles.bottomSheetButton}
            onPress={() => {
              openImageGallery();
              sheetRef.current?.close();
            }}
          >
            <Text style={styles.bottomSheetButtonNormalText}>
              Change cover image
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomSheetButton}
            onPress={() => {
              removeSelectedImage();
              sheetRef.current?.close();
            }}
          >
            <Text style={styles.bottomSheetButtonDeleteText}>
              Delete cover image
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  );
};

export default CreateLivestream;
