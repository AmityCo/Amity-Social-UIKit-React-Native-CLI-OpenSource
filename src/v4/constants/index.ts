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
};

export const COMMENT_ERROR_MESSAGE = {
  BLOCKED_WORD:
    'Your comment contains inappropriate word. Please review and delete it.',
  BLOCKED_URL:
    "Your comment contains a link that's not allowed. Please review and delete it.",
  GENERIC: 'Oops, something went wrong',
};
