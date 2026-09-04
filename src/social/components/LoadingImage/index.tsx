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
  // Reports this frame's upload state keyed by its own `source`, so the
  // composer can gate Post on every frame at once. The old shared
  // `setIsUploading` boolean was flipped back to false by whichever upload
  // finished first, unlocking Post while the other frames were still in flight.
  onUploadingChange?: (isUploading: boolean, source: string) => void;
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
  onUploadingChange,
  carousel = false,
}: OverlayImageProps) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isProcess, setIsProcess] = useState<boolean>(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const styles = useStyles();
  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    onUploadingChange?.(false, source);
  }, [onUploadingChange, source]);

  useEffect(() => {
    if (progress === 100) {
      setIsProcess(true);
    }
  }, [progress]);

  const uploadFileToAmity = useCallback(async () => {
    onUploadingChange?.(true, source);
    setIsUploadError(false);
    // Clearing the local flag alone left this source inside the parent's
    // `imageErrors` set, and that set is otherwise only cleared by the
    // mount effect below — which does not re-run on a retry, since neither
    // `isUploaded` nor `source` changed. Post stayed disabled even after the
    // retry uploaded fine, so tell the parent the error is gone up front.
    onUploadError?.(false, source);
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
        // `handleLoadEnd` already reports the upload as finished — the extra
        // setter call it used to be paired with was redundant.
        handleLoadEnd();
        setIsProcess(false);
        setIsUploadError(true);
        onUploadError?.(true, source);
      }
    } catch (error) {
      handleLoadEnd();
      setIsProcess(false);
      setIsUploadError(true);
      onUploadError?.(true, source);
    }
  }, [
    handleLoadEnd,
    index,
    onLoadFinish,
    onUploadError,
    onUploadingChange,
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

  // A frame can be removed (or its source swapped) while its upload is still
  // in flight, in which case `handleLoadEnd` never runs and the composer would
  // keep waiting on an entry no mounted child owns any more — leaving Post
  // disabled forever. Clearing it from this cleanup keeps the
  // bookkeeping in the same component that added it.
  useEffect(() => {
    return () => {
      onUploadingChange?.(false, source);
    };
  }, [onUploadingChange, source]);

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
