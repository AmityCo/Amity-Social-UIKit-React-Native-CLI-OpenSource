import { FileRepository } from '@amityco/ts-sdk-react-native';

export const isValidImageType = (mimeType: string | undefined): boolean => {
  // Some Android pickers/cameras return no MIME or a non-JPEG/PNG image type
  // (e.g. image/heic, image/webp). Treat a missing MIME as acceptable (let the
  // upload host validate it) and accept any image/* type, so a valid photo is
  // never silently dropped by client-side validation.
  if (!mimeType) return true;

  return mimeType.toLowerCase().startsWith('image/');
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

/**
 * Strips non-serializable properties (functions, class instances) from an
 * Amity.Community SDK object before passing it as a React Navigation param.
 * React Navigation warns when navigation state contains non-serializable
 * values; SDK objects can contain methods such as `createInvitations`.
 */
export const serializeCommunity = (
  community: Amity.Community | undefined | null
): Amity.Community | undefined => {
  if (!community) return undefined;
  return {
    communityId: community.communityId,
    displayName: community.displayName,
    isPublic: community.isPublic,
    isJoined: community.isJoined,
    isOfficial: community.isOfficial,
    postSetting: community.postSetting,
    allowCommentInStory: community.allowCommentInStory,
    avatarFileId: community.avatarFileId,
    description: community.description,
    membersCount: community.membersCount,
    postsCount: community.postsCount,
    needApprovalOnPostCreation: (community as Record<string, unknown>)
      .needApprovalOnPostCreation,
  } as unknown as Amity.Community;
};
