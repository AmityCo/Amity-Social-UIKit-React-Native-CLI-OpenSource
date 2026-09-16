import { FileRepository } from '@amityco/ts-sdk-react-native';
import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { ERROR_CODE } from '../constants';
import { resolveString } from '../localization';
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

    // Attach the file as a React-Native { uri, name, type } multipart part.
    // This works on both the Old and New (Bridgeless) Architecture and is what
    // the SDK's uploadImage expects (it reads files[0].name for preferredFilename).
    appendFileToFormData(formData, 'files', file, fileName, 'image/jpeg');

    return await mutateAsync(
      {
        file: formData,
        onProgress,
        altText,
      },
      {
        onError: (error) => {
          // Localized, and worded from the same four keys web resolves in
          // v4/social/hooks/useImageUpload (PDT-5177). These were hardcoded
          // English, so th.json never applied even though every key was already
          // translated — and the generic body read "Please try again." where web
          // says "Upload Not Complete".
          if (
            error.message.includes(ERROR_CODE.INVALID_IMAGE) ||
            error.message.includes(ERROR_CODE.VIOLENCE)
          ) {
            Alert.alert(
              resolveString('amity_social_button_inappropriate_image'),
              resolveString('amity_social_modal_dialog_image_upload_error'),
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert(
              resolveString('amity_social_error_upload_failed_title'),
              resolveString('amity_social_upload_not_complete'),
              [{ text: 'OK' }]
            );
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
