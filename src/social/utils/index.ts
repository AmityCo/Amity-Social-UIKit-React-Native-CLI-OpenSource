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
