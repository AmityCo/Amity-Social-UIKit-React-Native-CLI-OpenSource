import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
import { SvgXml } from 'react-native-svg';
import {
  deleteAmityFile,
  uploadImageFile,
} from '../../../providers/file-provider';
import { closeIcon, toastIcon } from '../../../svg/svg-xml-list';
import { useStyles } from './styles';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

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
}: OverlayImageProps) => {
  const theme = useTheme() as MyMD3Theme;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploaded, source]);

  const onRetryUpload = () => {
    uploadFileToAmity();
  };
  return (
    <View style={fileCount >= 3 ? styles.image3XContainer : styles.container}>
      <Image
        source={{ uri: source }}
        resizeMode="contain"
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
        <SvgXml xml={closeIcon(theme.colors.base)} width="12" height="12" />
      </TouchableOpacity>
    </View>
  );
};
export default LoadingImage;
