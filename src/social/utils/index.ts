export const isValidImageType = (mimeType: string | undefined): boolean => {
  if (!mimeType) return false;

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  return validTypes.includes(mimeType.toLowerCase());
};

// Only Amity file URLs (api/apix/upload.<region>.amity.co) take a size
// parameter. Any other URL - a custom avatar on a third-party CDN, a local
// file - is used as given.
const isAmityFileUrl = (url: string) => /\.amity\.(co|io)\b/i.test(url);

export const getFileUrlWithSize = (
  fileUrl: string,
  size: 'small' | 'medium' | 'large' | 'full' = 'medium'
) => {
  if (!fileUrl || !isAmityFileUrl(fileUrl)) return fileUrl;
  const [base, query] = fileUrl.split('?');
  const kept = (query ?? '')
    .split('&')
    .filter((part) => part && !part.startsWith('size='))
    .join('&');
  return `${base}?${kept ? `${kept}&` : ''}size=${size}`;
};

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
