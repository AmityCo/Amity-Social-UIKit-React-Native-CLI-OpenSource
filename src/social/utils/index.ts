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

// Comment types the comment lists render.
const RENDERED_COMMENT_TYPES = ['text', 'image'];

/**
 * Whether a comment belongs in a comment list. Use this instead of a
 * `dataTypes` filter on getComments: the SDK checks `comment.dataTypes`,
 * which its optimistic comment lacks, so the filter hid a new comment until
 * the server answered. A failed send (syncState 'error') is left out; the
 * composer gets its text back instead.
 */
export const isVisibleComment = (comment: Amity.InternalComment): boolean => {
  // Amity.SyncState is an ambient const enum, so it can't be read at runtime.
  if ((comment.syncState as string) === 'error') return false;
  const types = (comment as { dataTypes?: string[] }).dataTypes ?? [
    comment.dataType ?? 'text',
  ];
  return types.some((type) => RENDERED_COMMENT_TYPES.includes(type));
};

/** Whether a comment was created optimistically and is not yet on the server. */
export const isPendingComment = (comment: Amity.InternalComment): boolean =>
  (comment.syncState as string) === 'syncing';

/**
 * Re-applies a community query's membership filter to its results. The SDK's
 * community live collections re-emit the same list when the current user
 * joins or leaves a community, without filtering it again, so a community the
 * user just left stayed in their communities list until it was refetched.
 */
export const filterCommunitiesByMembership = (
  communities: Amity.Community[],
  membership: 'all' | 'member' | 'notMember'
) => {
  if (membership === 'member') {
    return communities.filter((community) => community.isJoined !== false);
  }
  if (membership === 'notMember') {
    return communities.filter((community) => community.isJoined !== true);
  }
  return communities;
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
