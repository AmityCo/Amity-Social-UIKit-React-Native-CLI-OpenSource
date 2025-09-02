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
