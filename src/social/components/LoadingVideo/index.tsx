import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  ImageStyle,
  Image,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { SvgXml } from 'react-native-svg';
import { deleteAmityFile, uploadVideoFile } from '../../../core/legacy/file';
import {
  closeIcon,
  playBtn,
  toastIcon,
  videoControlIcon,
} from '../../../core/assets/icons/xml';
import { useStyles } from './styles';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import uiSlice from '../../../core/stores/slices/uiSlice';
import { createVideoThumbnail } from 'react-native-compressor';
import { useUIKitDispatch } from '../../../core/stores/store';

interface OverlayImageProps {
  source: string;
  onClose?: (originalPath: string, fileId?: string, postId?: string) => void;
  onLoadFinish?: (
    fileId: string,
    fileUrl: string,
    fileName: string,
    index: number,
    originalPath: string,
    thumbNail: string
  ) => void;
  onUploadError?: (hasError: boolean, source: string) => void;
  index?: number;
  isUploaded: boolean;
  fileId?: string;
  thumbNail: string;
  onPlay?: (fileUrl: string) => void;
  isEditMode?: boolean;
  fileCount?: number;
  postId?: string;
  setIsUploading?: (arg: boolean) => void;
  carousel?: boolean;
}
const LoadingVideo = ({
  source,
  onClose,
  index,
  onLoadFinish,
  onUploadError,
  isUploaded = false,
  thumbNail,
  onPlay,
  fileId,
  isEditMode = false,
  fileCount,
  postId,
  setIsUploading,
  carousel = false,
}: OverlayImageProps) => {
  const dispatch = useUIKitDispatch();
  const { showToastMessage } = uiSlice.actions;
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isProcess, setIsProcess] = useState<boolean>(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const [thumbNailImage, setThumbNailImage] = useState(thumbNail ?? '');
  // `uploadFileToAmity` is memoised on [source] only, so reading the state
  // there would capture the empty first-render value. Mirror it into a ref so
  // the upload callback always sees the frame that was actually decoded.
  const thumbNailImageRef = useRef(thumbNail ?? '');
  const styles = useStyles();
  const [playingUri, setPlayingUri] = useState<string>('');
  const [isPause, setIsPause] = useState<boolean>(true);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const playVideoFullScreen = (fileUrl: string) => {
    if (Platform.OS === 'ios') {
      setPlayingUri(fileUrl);
    } else {
      setIsPause(true);
      navigation.navigate('VideoPlayer', { source: source });
    }
  };
  const onClosePlayer = () => {
    setIsPause(true);
    setPlayingUri('');
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setIsUploading(false);
  };

  const processThumbNail = async () => {
    const generatedThumbNail = await createVideoThumbnail(source);
    thumbNailImageRef.current = generatedThumbNail.path;
    setThumbNailImage(generatedThumbNail.path);
  };
  useEffect(() => {
    processThumbNail();
  }, [thumbNail]);

  useEffect(() => {
    if (progress === 100) {
      setIsProcess(true);
    }
  }, [progress]);

  const uploadFileToAmity = useCallback(async () => {
    setIsUploading(true);
    setIsUploadError(false);
    try {
      const file: Amity.File<any>[] = await uploadVideoFile(
        source,
        (percent: number) => {
          setProgress(percent);
        }
      );
      if (file) {
        setIsProcess(false);
        handleLoadEnd();
        onLoadFinish &&
          onLoadFinish(
            file[0]?.fileId as string,
            file[0]?.fileUrl as string,
            file[0]?.attributes.name as string,
            index as number,
            source,
            // Hand back the frame this component decoded, not the incoming
            // prop — for a newly picked video that prop is empty, so the
            // generated thumbnail used to be dropped on the floor. The
            // composer stores it so the feed can show it while the server is
            // still transcoding (PDT-4904).
            thumbNailImageRef.current || thumbNail
          );
      } else {
        handleLoadEnd();
        dispatch(showToastMessage({ toastMessage: 'Failed to upload file' }));
        setIsProcess(false);
        setIsUploadError(true);
        onUploadError?.(true, source);
      }
    } catch (error) {
      handleLoadEnd();
      dispatch(showToastMessage({ toastMessage: 'Failed to upload file' }));
      setIsProcess(false);
      setIsUploadError(true);
      onUploadError?.(true, source);
    }
  }, [source]);

  const handleDelete = async () => {
    if (fileId && !isEditMode) {
      await deleteAmityFile(fileId);
    }
    onClose && onClose(source, fileId, postId);
  };
  useEffect(() => {
    setIsUploadError(false);
    onUploadError?.(false, source);
    setProgress(0);
    setIsProcess(false);
    if (isUploaded) {
      setLoading(false);
    } else {
      uploadFileToAmity();
    }
  }, [fileId, isUploaded, source]);

  const handleOnPlay = () => {
    // In carousel mode the parent (onPlay) owns the full-screen media viewer,
    // so this component never mounts the inline <Video> and never receives a
    // dismiss callback to unpause with. Leaving `isPause` alone keeps the play
    // icon rendered, which is what the frame shows once the viewer closes
    // (PDT-4904); toggling it here hid the icon for the rest of the session.
    if (onPlay) {
      onPlay(source);
      return;
    }
    setIsPause(!isPause);
    playVideoFullScreen(source);
  };

  const onRetryUpload = () => {
    uploadFileToAmity();
  };

  return (
    <View
      style={
        carousel
          ? styles.carouselContainer
          : fileCount >= 3
          ? styles.image3XContainer
          : styles.container
      }
    >
      {!loading && !isUploadError && isPause && (
        <TouchableOpacity style={styles.playButton} onPress={handleOnPlay}>
          <SvgXml
            xml={carousel ? videoControlIcon : playBtn}
            width={carousel ? 40 : 50}
            height={carousel ? 40 : 50}
          />
        </TouchableOpacity>
      )}
      {playingUri && !isPause ? (
        <Video
          controls
          style={styles.image}
          source={{ uri: playingUri }}
          onFullscreenPlayerWillDismiss={onClosePlayer}
          paused={isPause}
        />
      ) : thumbNailImage ? (
        <Image
          resizeMode="cover"
          source={{ uri: thumbNailImage }}
          style={[
            styles.image as ImageStyle,
            (loading ? styles.loadingImage : styles.loadedImage) as ImageStyle,
          ]}
        />
      ) : (
        <View style={styles.image} />
      )}

      {loading ? (
        <View style={styles.overlay}>
          {isProcess ? (
            <Progress.CircleSnail
              size={24}
              borderColor="transparent"
              thickness={2}
            />
          ) : (
            <Progress.Circle
              progress={progress / 100}
              size={24}
              borderColor="transparent"
              unfilledColor="#ffffff"
              thickness={2}
            />
          )}
        </View>
      ) : isUploadError ? (
        <TouchableOpacity style={styles.overlay} onPress={onRetryUpload}>
          <SvgXml xml={toastIcon()} width="24" height="24" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.closeButton}
          disabled={(loading || isProcess) && !isUploadError}
          onPress={handleDelete}
        >
          <SvgXml xml={closeIcon('white')} width="12" height="12" />
        </TouchableOpacity>
      )}
    </View>
  );
};
export default LoadingVideo;
