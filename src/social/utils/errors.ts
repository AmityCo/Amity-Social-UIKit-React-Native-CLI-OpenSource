import {
  COMMENT_ERROR_MESSAGE,
  ERROR_CODE,
  POST_ERROR_MESSAGE,
} from '../../core/constants';

export const getCommentErrorMessage = (error: Error): string => {
  if (error.message.includes(ERROR_CODE.BLOCKED_WORD)) {
    return COMMENT_ERROR_MESSAGE.BLOCKED_WORD;
  }

  if (error.message.includes(ERROR_CODE.BLOCKED_URL)) {
    return COMMENT_ERROR_MESSAGE.BLOCKED_URL;
  }

  return COMMENT_ERROR_MESSAGE.GENERIC;
};

export const getPostErrorMessage = (
  error: Error,
  isEditMode?: boolean
): string => {
  if (error.message.includes(ERROR_CODE.BLOCKED_WORD)) {
    return POST_ERROR_MESSAGE.BLOCKED_WORD;
  }

  if (error.message.includes(ERROR_CODE.BLOCKED_URL)) {
    return POST_ERROR_MESSAGE.BLOCKED_URL;
  }

  return isEditMode
    ? POST_ERROR_MESSAGE.GENERIC_EDIT
    : POST_ERROR_MESSAGE.GENERIC_CREATE;
};
