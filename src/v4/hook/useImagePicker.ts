import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  launchCamera,
  CameraOptions,
} from 'react-native-image-picker';
import { deleteAmityFile, uploadImageFile } from '~/providers/file-provider';
import { isValidImageType } from '../utils';
import { useCameraPermission } from './usePermissions';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] =
    useState<Amity.File<'image'> | null>(null);

  const uploadFileToAmity = async (path: string) => {
    try {
      setImageUri(path);
      setIsLoading(true);
      const uploadedImages = await uploadImageFile(path, setProgress);
      setUploadedImage(uploadedImages[0]);
      setIsLoading(false);
      setProgress(0);
      return uploadedImages[0];
    } catch (error) {
      Alert.alert('Upload failed', 'Please try again.', [{ text: 'OK' }]);
      return null;
    } finally {
      setIsLoading(false);
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
    isLoading,
    imageUri,
    progress,
    uploadedImage,
    removeSelectedImage,
    openImageGallery,
    openCamera,
  };
};

export default useImagePicker;
