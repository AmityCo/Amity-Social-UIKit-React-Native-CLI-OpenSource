import { useCallback, useEffect, useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
import { SvgXml } from 'react-native-svg';
import { deleteAmityFile, uploadImageFile } from '../../../core/legacy/file';
import { closeIcon, toastIcon } from '../../../core/assets/icons/xml';
import { useStyles } from './styles';

interface OverlayImageProps {
  source: string;
  onClose?: (originalPath: string, field?: string, postId?: string) => void;
  onLoadFinish?: (
    fileId: string,
    fileUrl: string,
    fileName: string,
    index: number,
    originalPath: string
  ) => void;
  onUploadError?: (hasError: boolean, source: string) => void;
  index?: number;
  isUploaded: boolean;
  fileId?: string;
  isEditMode?: boolean;
  fileCount?: number;
  postId?: string;
  setIsUploading?: (arg: boolean) => void;
  carousel?: boolean;
}
const LoadingImage = ({
  source,
  onClose,
  index,
  onLoadFinish,
  onUploadError,
  isUploaded = false,
  fileId = '',
  isEditMode = false,
  fileCount,
  postId,
  setIsUploading,
  carousel = false,
}: OverlayImageProps) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isProcess, setIsProcess] = useState<boolean>(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const styles = useStyles();
  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    setIsUploading(false);
  }, [setIsUploading]);

  useEffect(() => {
    if (progress === 100) {
      setIsProcess(true);
    }
  }, [progress]);

  const uploadFileToAmity = useCallback(async () => {
    setIsUploading(true);
    setIsUploadError(false);
    try {
      const file: Amity.File<any>[] = await uploadImageFile(
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
            (file[0]?.fileUrl + '?size=medium') as string,
            file[0]?.attributes.name as string,
            index as number,
            source
          );
      } else {
        setIsUploading(false);
        handleLoadEnd();
        setIsProcess(false);
        setIsUploadError(true);
        onUploadError?.(true, source);
      }
    } catch (error) {
      handleLoadEnd();
      setIsProcess(false);
      setIsUploading(false);
      setIsUploadError(true);
      onUploadError?.(true, source);
    }
  }, [
    handleLoadEnd,
    index,
    onLoadFinish,
    onUploadError,
    setIsUploading,
    source,
  ]);

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
  }, [isUploaded, source]);

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
      <Image
        source={{ uri: source }}
        resizeMode={carousel ? 'cover' : 'contain'}
        style={[
          styles.image,
          loading ? styles.loadingImage : styles.loadedImage,
        ]}
      />
      {loading && (
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
      )}
      {!loading && isUploadError && (
        <View style={styles.failedOverlay}>
          <TouchableOpacity style={styles.errorOverlay} onPress={onRetryUpload}>
            <SvgXml xml={toastIcon()} width="28" height="28" />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.closeButton}
        disabled={(loading || isProcess) && !isUploadError}
        onPress={handleDelete}
      >
        <SvgXml xml={closeIcon('white')} width="12" height="12" />
      </TouchableOpacity>
    </View>
  );
};
export default LoadingImage;
