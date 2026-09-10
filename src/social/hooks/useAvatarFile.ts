import { useCallback } from 'react';
import { FileRepository } from '@amityco/ts-sdk-react-native';
import { ImageSizeState, ImageSizeSubset } from '../enums/imageSizeState';
import {
  defaultAvatarUri,
  defaultCommunityAvatarUri,
} from '../../core/assets/index';

interface useAvatarFileProps {
  fileId: string;
  imageSize?: ImageSizeSubset;
  /**
   * Which default to fall back on. Required rather than defaulted: the
   * fallback is a picture, and a caller that has not thought about which
   * picture is usually a caller that wanted a file url, not an avatar.
   */
  type: 'user' | 'community';
}

/**
 * Resolves an avatar file to a display url, falling back to the default avatar
 * image when there is nothing to resolve.
 *
 * That fallback is the whole reason this is not `useFile`: a miss — no id, no
 * file, no url — answers with a picture of a person, which is right for a
 * profile picture and wrong for everything else. Handing it back for a video
 * whose thumbnail is still transcoding drew a person icon in the carousel as
 * though it were the frame.
 *
 * For any other file use `useFile`, which resolves through the SDK and leaves
 * an unresolved file undefined.
 */
export const useAvatarFile = () => {
  const getAvatarUrl = useCallback(
    async ({
      fileId,
      imageSize = ImageSizeState.medium,
      type,
    }: useAvatarFileProps) => {
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
  return { getAvatarUrl };
};
