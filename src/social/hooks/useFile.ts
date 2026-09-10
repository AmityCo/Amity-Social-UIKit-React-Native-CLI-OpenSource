import { useCallback } from 'react';
import { FileRepository } from '@amityco/ts-sdk-react-native';
import { ImageSizeState, ImageSizeSubset } from '../enums/imageSizeState';
import {
  defaultAvatarUri,
  defaultCommunityAvatarUri,
} from '../../core/assets/index';

interface useFileProps {
  fileId: string;
  imageSize?: ImageSizeSubset;
  type?: 'user' | 'community';
}

/**
 * Resolves an **avatar** file to a display url.
 *
 * A miss — no id, no file, no url — answers with the default avatar (or
 * community avatar) image, which is the right placeholder for a profile
 * picture and the wrong one for anything else. Post media must not be resolved
 * through here: handing an avatar back for a video whose thumbnail is still
 * transcoding renders a person icon in the carousel as though it were the
 * frame. Resolve media with FileRepository directly and let an unresolved file
 * stay undefined.
 */
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
        (type === 'community' ? defaultCommunityAvatarUri : defaultAvatarUri);
      return newImageUrl;
    },
    []
  );
  return { getImage };
};
