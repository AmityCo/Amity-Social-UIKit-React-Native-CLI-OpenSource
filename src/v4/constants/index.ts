export const SECOND = 1000;

export const MINUTE = 60 * SECOND;

export const HOUR = 60 * MINUTE;

export const DAY = 24 * HOUR;

export const WEEK = 7 * DAY;

export const MONTH = 30 * DAY;

export const YEAR = 365 * DAY;

export const MAX_POLL_QUESTION_LENGTH = 500;

export const MAX_POLL_ANSWER_LENGTH = 60;

export const ERROR_CODE = {
  BLOCKED_WORD: '400308',
  BLOCKED_URL: '400309',
  IMAGE_NUDITY: '500000',
  ONLY_ONE_MODERATOR: '400317',
  ONLY_ONE_MEMBER: '400318',
};

export const COMMENT_ERROR_MESSAGE = {
  BLOCKED_WORD:
    'Your comment contains inappropriate word. Please review and delete it.',
  BLOCKED_URL:
    "Your comment contains a link that's not allowed. Please review and delete it.",
  GENERIC: 'Oops, something went wrong',
};

export const MAX_COMMUNITY_NAME_LENGTH = 30;

export const MAX_COMMUNITY_DESCRIPTION_LENGTH = 180;

export const MemberRoles = {
  MEMBER: 'member',
  MODERATOR: 'moderator',
  SUPER_MODERATOR: 'super-moderator',
  COMMUNITY_MODERATOR: 'community-moderator',
  CHANNEL_MODERATOR: 'channel-moderator',
  ADMIN: 'global-admin',
};

export const Permissions = {
  EditUserPermission: 'EDIT_USER',
  BanUserPermission: 'BAN_USER',
  CreateRolePermission: 'CREATE_ROLE',
  EditRolePermission: 'EDIT_ROLE',
  DeleteRolePermission: 'DELETE_ROLE',
  AssignRolePermission: 'ASSIGN_USER_ROLE',
  EditChannelPermission: 'EDIT_CHANNEL',
  EditChannelRatelimitPermission: 'EDIT_CHANNEL_RATELIMIT',
  MuteChannelPermission: 'MUTE_CHANNEL',
  CloseChannelPermission: 'CLOSE_CHANNEL',
  AddChannelUserPermission: 'ADD_CHANNEL_USER',
  EditChannelUserPermission: 'EDIT_CHANNEL_USER',
  RemoveChannelUserPermission: 'REMOVE_CHANNEL_USER',
  MuteChannelUserPermission: 'MUTE_CHANNEL_USER',
  BanChannelUserPermission: 'BAN_CHANNEL_USER',
  EditMessagePermission: 'EDIT_MESSAGE',
  DeleteMessagePermission: 'DELETE_MESSAGE',
  EditCommunityPermission: 'EDIT_COMMUNITY',
  DeleteCommunityPermission: 'DELETE_COMMUNITY',
  AddChannelCommunityPermission: 'ADD_COMMUNITY_USER',
  EditChannelCommunityPermission: 'EDIT_COMMUNITY_USER',
  RemoveChannelCommunityPermission: 'REMOVE_COMMUNITY_USER',
  MuteChannelCommunityPermission: 'MUTE_COMMUNITY_USER',
  BanChannelCommunityPermission: 'BAN_COMMUNITY_USER',
  EditUserFeedPostPermission: 'EDIT_USER_FEED_POST',
  DeleteUserFeedPostPermission: 'DELETE_USER_FEED_POST',
  EditUserFeedCommentPermission: 'EDIT_USER_FEED_COMMENT',
  DeleteUserFeedCommentPermission: 'DELETE_USER_FEED_COMMENT',
  EditCommunityFeedPostPermission: 'EDIT_COMMUNITY_FEED_POST',
  DeleteCommunityFeedPostPermission: 'DELETE_COMMUNITY_FEED_POST',
  EditCommunityFeedCommentPermission: 'EDIT_COMMUNITY_FEED_COMMENT',
  DeleteCommunityFeedCommentPermission: 'DELETE_COMMUNITY_FEED_COMMENT',
  CreateCommunityCategoryPermission: 'CREATE_COMMUNITY_CATEGORY',
  EditCommunityCategoryPermission: 'EDIT_COMMUNITY_CATEGORY',
  DeleteCommunityCategoryPermission: 'DELETE_COMMUNITY_CATEGORY',
  ManageStoryPermission: 'MANAGE_COMMUNITY_STORY',
};

export const QUERY_KEY = {
  SEARCH_MEMBER_BY_DISPLAY_NAME_COLLECTION:
    'search-member-by-display-name-collection',
  CATEGORY_COLLECTION: 'category-collections',
  USERS_COLLECTION: 'users-collections',
  SEARCH_USERS_BY_DISPLAY_NAME_COLLECTION:
    'search-users-by-display-name-collections',
  COMMUNITY_MEMBERS_COLLECTION: 'community-members-collections',
  POSTS_COLLECTION: 'posts-collections',
  PINNED_POSTS_COLLECTION: 'pinned-posts-collections',
};
