import { FileRepository } from '@amityco/ts-sdk-react-native';

export const isValidImageType = (mimeType: string | undefined): boolean => {
  if (!mimeType) return false;

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  return validTypes.includes(mimeType.toLowerCase());
};

export const getFileUrlWithSize = (
  fileUrl: string,
  size: 'small' | 'medium' | 'large' | 'full' = 'medium'
) => FileRepository.fileUrlWithSize(fileUrl, size);

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const isPinnedPost = (post: any): post is Amity.PinnedPost => {
  return post.pinnedAt !== undefined;
};
