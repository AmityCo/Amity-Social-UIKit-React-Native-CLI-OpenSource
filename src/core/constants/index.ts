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
  CreateEventPermission: 'CREATE_EVENT',
  UpdateEventPermission: 'UPDATE_EVENT',
  DeleteEventPermission: 'DELETE_EVENT',
};

export const text_contain_blocked_word = 'Text contain blocked word';

export const comment_contains_inapproproate_word =
  'Your comment contains inappropriate word. Please review and delete it.';

export const ALLOWED_MEDIA_TYPE = {
  image: ['jpg', 'jpeg', 'png'],
  video: ['mp4', 'mov'],
};

export const STORY_DEFAULT_DURATION = 7000;

export const SECOND = 1000;

export const MINUTE = 60 * SECOND;

export const HOUR = 60 * MINUTE;

export const DAY = 24 * HOUR;

export const WEEK = 7 * DAY;

export const MONTH = 30 * DAY;

export const YEAR = 365 * DAY;

export const MAX_POLL_QUESTION_LENGTH = 500;

export const MAX_POLL_ANSWER_LENGTH = 60;

export const MAXIMUM_POST_CHARACTERS = 50000;

export const MAX_MENTION_USERS = 30;

export const ERROR_CODE = {
  BLOCKED_WORD: '400308',
  BLOCKED_URL: '400309',
  IMAGE_NUDITY: '500000',
  VIOLENCE: '400314',
  ONLY_ONE_MODERATOR: '400317',
  ONLY_ONE_MEMBER: '400318',
  GLOBAL_BAN: '400312',
  INVALID_IMAGE:
    'Amity SDK (500000): Image uploading failed: Request has invalid image format',
  DISPLAY_NAME_UPDATE: '400301',
  VISITOR_USAGE_LIMIT_EXCEEDED: '400323',
};

export const VISITOR_USAGE_LIMIT_MESSAGE = {
  TITLE: "You've reached your daily limit.",
  SUBTITLE: 'Create an account or sign in to keep exploring the community.',
  SIGN_IN: 'Sign in',
  TOAST: 'Create an account or sign in to continue.',
};

// Web parity: amity_social_label_create_account_or_sign_in
export const VISITOR_USER_ACTION_TOAST =
  'Create an account or sign in to continue.';

export const COMMENT_ERROR_MESSAGE = {
  BLOCKED_WORD:
    'Your comment contains inappropriate word. Please review and delete it.',
  BLOCKED_URL:
    "Your comment contains a link that's not allowed. Please review and delete it.",
  GENERIC: 'Oops, something went wrong',
};

export const POST_ERROR_MESSAGE = {
  BLOCKED_WORD: "Your post wasn't posted as it contains an inappropriate word.",
  BLOCKED_URL:
    "Your post wasn't posted as it contains a link that's not allowed.",
  GENERIC_CREATE: 'Failed to create post. Please try again.',
  GENERIC_EDIT: 'Failed to edit post. Please try again.',
};

export const CHARACTER_LIMIT = {
  USER_DISPLAY_NAME: 100,
  USER_DESCRIPTION: 180,
  COMMUNITY_NAME: 30,
  COMMUNITY_DESCRIPTION: 180,
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

// Matches the spec: https://github.com/AmityCo/cleverden/blob/feat/frontend-agentic/tech-specs/18-links-detection-in-console.md
// (?<![\w])      — skip URLs embedded inside words  e.g. my_http://x
// (?<![.])       — strip trailing dots
// (?![^\s]*\()   — reject if non-space text after match still contains '('
//                  (unbalanced paren → no match, balanced (1) → full match)
export const URL_REGEX =
  /(?<![\w])(?:(?:https?|ftp):\/\/(?:[a-zA-Z0-9.-]+|[\d.]+)(?::\d{1,5})?(?:\/(?:[^\s<>|()]*(?:\([^\s<>|()]*\)[^\s<>|()]*)*)*)?(?<![.])(?![^\s]*\()|mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|www\.(?:[a-zA-Z0-9.-]+)(?:\/(?:[^\s<>|()]*(?:\([^\s<>|()]*\)[^\s<>|()]*)*)*)?(?<![.])(?![^\s]*\())/g;

// Use this factory when calling exec() in a loop — a fresh RegExp instance
// avoids the stateful lastIndex issue that comes with the global /g flag.
export const createUrlRegex = () => new RegExp(URL_REGEX.source, 'g');

export const TOAST = {
  SHARE: {
    COPY: {
      SUCCESS: 'Link copied',
    },
  },
  USER: {
    REPORT: {
      SUCCESS: 'User reported.',
      FAILED: 'Failed to report user. Please try again.',
    },
    UNREPORT: {
      SUCCESS: 'User unreported.',
      FAILED: 'Failed to unreport user. Please try again.',
    },
    BLOCK: {
      SUCCESS: 'User blocked.',
      FAILED: 'Failed to block user. Please try again.',
    },
    UNBLOCK: {
      SUCCESS: 'User unblocked.',
      FAILED: 'Failed to unblock user. Please try again.',
    },
    UNFOLLOW: {
      FAILED: 'Oops, something went wrong.',
    },
    RELATIONSHIP: {
      FOLLOW_TO_INTERACT: 'Follow user to interact.',
    },
    FOLLOW_REQUEST: {
      ACCEPT: {
        SUCCESS: (displayName: string) =>
          `${displayName} is now following you.`,
      },
      DECLINE: {
        SUCCESS: 'Following request declined.',
      },
    },
  },
  POST: {
    REPORT: {
      SUCCESS: 'Post reported.',
      FAILED: 'Failed to report post. Please try again.',
    },
    UNREPORT: {
      SUCCESS: 'Post unreported.',
      FAILED: 'Failed to unreport post. Please try again.',
    },
  },
  POLL: {
    CLOSE: {
      SUCCESS: 'Post closed.',
      FAILED: 'Oops, something went wrong.',
    },
  },
  COMMUNITY: {
    PROFILE: {
      UPDATE: {
        SUCCESS: 'Successfully updated community profile.',
        FAILED: 'Failed to save your community profile. Please try again.',
      },
    },
    NOTIFICATION: {
      LOAD: {
        FAILED: 'Failed to load notification settings.',
      },
      UPDATE: {
        SUCCESS: 'Notification settings saved.',
        FAILED: 'Failed to save notification settings. Please try again.',
      },
    },
  },
} as const;

export const ALERT = {
  ACTION: {
    OK: 'OK',
    CANCEL: 'Cancel',
    BLOCK: 'Block',
    UNBLOCK: 'Unblock',
    UNFOLLOW: 'Unfollow',
  },
  USER: {
    BLOCK: {
      TITLE: 'Block user?',
      MESSAGE: (displayName: string) =>
        `${displayName} won't be able to see posts and comments that you've created. They won't be notified that you've blocked them.`,
    },
    UNBLOCK: {
      TITLE: 'Unblock user?',
      MESSAGE: (displayName: string) =>
        `${displayName} will now be able to see posts and comments that you've created. They won't be notified that you've unblocked them.`,
    },
    FOLLOW: {
      TITLE: 'Unable to follow this user',
      MESSAGE: 'Oops! something went wrong. Please try again later.',
    },
    UNFOLLOW: {
      TITLE: 'Unfollow this user?',
      MESSAGE:
        "If you change your mind, you'll have to request to follow them again.",
    },
  },
  POLL: {
    CLOSE: {
      TITLE: 'Close poll?',
      MESSAGE:
        "The poll duration you've set will be ignored and your poll will be closed immediately.",
      ACTION: 'Close poll',
    },
  },
  NOTIFICATION: {
    LEAVE_WITHOUT_FINISHING: {
      TITLE: 'Leave without finishing?',
      MESSAGE: 'Your changes that you made may not be saved.',
      ACTION: 'Leave',
    },
  },
  MENTION: {
    TOO_MANY: {
      TITLE: 'Too many users mentioned',
      MESSAGE: 'You can only mention up to %s users per post.',
    },
  },
} as const;
