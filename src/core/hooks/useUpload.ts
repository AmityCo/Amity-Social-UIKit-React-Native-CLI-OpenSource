import { FileRepository } from '@amityco/ts-sdk-react-native';
import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { ERROR_CODE } from '../constants';
import { appendFileToFormData } from '../utils/fileUpload';

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

    // Use appendFileToFormData for New Architecture (RN ≥ 0.73 Bridgeless)
    // compatibility. The legacy { uri, name, type } plain-object pattern no
    // longer works in New Arch — we read the file into a real Blob via fetch().
    await appendFileToFormData(formData, 'files', file, fileName, 'image/jpeg');

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
