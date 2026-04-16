import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  launchCamera,
  CameraOptions,
} from 'react-native-image-picker';
import { isValidImageType } from '../utils';
import { useCameraPermission } from './usePermissions';
import { deleteAmityFile } from '../../core/legacy/file';
import { useUpload } from '../../core/hooks';

export type UseImagePickerResponse = {
  progress: number;
  isLoading: boolean;
  imageUri: string | null;
  removeSelectedImage: () => void;
  uploadedImage: Amity.File<'image'> | null;
  openCamera: (options: CameraOptions) => Promise<void | Amity.File<'image'>>;
  openImageGallery: (
    options: ImageLibraryOptions
  ) => Promise<void | Amity.File<'image'>>;
};

const useImagePicker = (): UseImagePickerResponse => {
  const { getCameraPermission } = useCameraPermission();
  const [progress, setProgress] = useState<number>(0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] =
    useState<Amity.File<'image'> | null>(null);
  const { uploadImage, isImageUploading } = useUpload();

  const uploadFileToAmity = async (path: string) => {
    try {
      setImageUri(path);
      const { data } = await uploadImage({
        file: path,
        onProgress: setProgress,
      });
      setUploadedImage(data[0]);
      setProgress(0);
      return data[0];
    } catch (error) {
      return null;
    } finally {
      setProgress(0);
    }
  };

  const openImageGallery = async (options: ImageLibraryOptions) => {
    const result = await launchImageLibrary(options);

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      if (!isValidImageType(result.assets[0]?.type)) {
        return Alert.alert(
          'Unsupported image type',
          'Please upload a PNG or JPG image.',
          [{ text: 'OK' }]
        );
      }
      return uploadFileToAmity(result.assets[0]?.uri);
    }
  };

  const openCamera = async (options: CameraOptions) => {
    const cameraPermission = await getCameraPermission();
    if (!cameraPermission) return Linking.openSettings();

    const result = await launchCamera(options);

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      if (!isValidImageType(result.assets[0]?.type)) {
        return Alert.alert(
          'Unsupported image type',
          'Please upload a PNG or JPG image.',
          [{ text: 'OK' }]
        );
      }
      return uploadFileToAmity(result.assets[0]?.uri);
    }
  };

  const removeSelectedImage = () => {
    setProgress(0);
    setImageUri(null);
    setUploadedImage(null);
    deleteAmityFile(uploadedImage?.fileId);
  };

  return {
    isLoading: isImageUploading,
    imageUri,
    progress,
    uploadedImage,
    removeSelectedImage,
    openImageGallery,
    openCamera,
  };
};

export default useImagePicker;
