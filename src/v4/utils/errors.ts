import { COMMENT_ERROR_MESSAGE, ERROR_CODE } from '../constants';

export const getCommentErrorMessage = (error: Error): string => {
  if (error.message.includes(ERROR_CODE.BLOCKED_WORD)) {
    return COMMENT_ERROR_MESSAGE.BLOCKED_WORD;
  }

  if (error.message.includes(ERROR_CODE.BLOCKED_URL)) {
    return COMMENT_ERROR_MESSAGE.BLOCKED_URL;
  }

  return COMMENT_ERROR_MESSAGE.GENERIC;
};
