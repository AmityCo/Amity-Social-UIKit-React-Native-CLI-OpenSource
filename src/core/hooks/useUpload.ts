import { FileRepository } from '@amityco/ts-sdk-react-native';
import { Alert, Platform } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { ERROR_CODE } from '../constants';

type UploadImageResponse = Awaited<
  ReturnType<typeof FileRepository.uploadImage>
>;

type UploadImageParams = Parameters<typeof FileRepository.uploadImage>;

type UploadImagePayload = {
  file: UploadImageParams[0];
  onProgress?: UploadImageParams[1];
  altText?: UploadImageParams[2];
};

type UploadSingleImageParams = {
  file: string;
  onProgress?: UploadImagePayload['onProgress'];
  altText?: UploadImagePayload['altText'];
};

export function useUpload() {
  const { mutateAsync, isPending } = useMutation<
    UploadImageResponse,
    Error,
    UploadImagePayload
  >({
    mutationFn: ({ file, onProgress, altText }) =>
      FileRepository.uploadImage(file, onProgress, altText),
  });

  const uploadImage = async ({
    file,
    onProgress,
    altText,
  }: UploadSingleImageParams) => {
    const formData = new FormData();
    const parts = file.split('/');
    const fileName = parts[parts.length - 1];
    const fileType = Platform.OS === 'ios' ? 'image/jpeg' : 'image/jpg';
    const uri = Platform.OS === 'android' ? file : file.replace('file://', '');

    formData.append('files', {
      name: fileName,
      type: fileType,
      uri: uri,
    });

    return await mutateAsync(
      {
        file: formData,
        onProgress,
        altText,
      },
      {
        onError: (error) => {
          if (
            error.message.includes(ERROR_CODE.INVALID_IMAGE) ||
            error.message.includes(ERROR_CODE.VIOLENCE)
          ) {
            Alert.alert(
              'Inappropriate image',
              'Please choose a different image to upload.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert('Upload failed', 'Please try again.', [{ text: 'OK' }]);
          }
        },
      }
    );
  };

  return {
    uploadImage,
    isImageUploading: isPending,
  };
}
