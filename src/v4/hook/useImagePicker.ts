import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  launchCamera,
} from 'react-native-image-picker';
import {
  deleteAmityFile,
  uploadImageFile,
} from '../../providers/file-provider';

type UseImagePickerType = {
  imageUri: string | null;
  removeSelectedImage: () => void;
  openImageGallery: () => Promise<void>;
  openCamera: () => Promise<void>;
  progress: number;
  uploadedImage: Amity.File<any> | null;
  isLoading: boolean;
};

const useImagePicker = (options: ImageLibraryOptions): UseImagePickerType => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const imageUriRef = useRef<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploadedImage, setUploadedImage] = useState<Amity.File<any> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const uploadFileToAmity = async (path) => {
    setIsLoading(true);
    const uploadedImages = await uploadImageFile(path, (percent) => {
      setProgress(percent);
    });
    setUploadedImage(uploadedImages[0]);
    setIsLoading(false);
  };

  const openImageGallery = async () => {
    await launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert(
          'ImagePicker Error:',
          response.errorCode + ', ' + response.errorMessage
        );
      } else {
        if (response.assets) {
          imageUriRef.current = response.assets[0].uri;
          setImageUri(response.assets[0].uri);
          uploadFileToAmity(response.assets[0].uri);
        }
      }
    });
  };
  const openCamera = async () => {
    await launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert(
          'ImagePicker Error:',
          response.errorCode + ', ' + response.errorMessage
        );
      } else {
        if (response.assets) {
          imageUriRef.current = response.assets[0].uri;
          setImageUri(response.assets[0].uri);
        }
      }
    });
  };

  const removeSelectedImage = () => {
    setImageUri(null);
    setUploadedImage(null);
    setProgress(0);
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
