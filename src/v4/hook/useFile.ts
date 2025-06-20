import { useCallback } from 'react';
import { FileRepository } from '@amityco/ts-sdk-react-native';
import { ImageSizeState, ImageSizeSubset } from '../enum/imageSizeState';
import { defaultAvatarUri, defaultCommunityAvatarUri } from '../assets/index';

interface useFileProps {
  fileId: string;
  imageSize?: ImageSizeSubset;
  type?: 'user' | 'community';
}

export const useFile = () => {
  const getImage = useCallback(
    async ({
      fileId,
      imageSize = ImageSizeState.medium,
      type = 'user',
    }: useFileProps) => {
      if (!fileId)
        return type === 'community'
          ? defaultCommunityAvatarUri
          : defaultAvatarUri;
      const file = await FileRepository.getFile(fileId);
      if (!file)
        return type === 'community'
          ? defaultCommunityAvatarUri
          : defaultAvatarUri;
      const newImageUrl =
        FileRepository.fileUrlWithSize(file.data.fileUrl, imageSize) ??
        defaultAvatarUri;
      return newImageUrl;
    },
    []
  );
  return { getImage };
};
