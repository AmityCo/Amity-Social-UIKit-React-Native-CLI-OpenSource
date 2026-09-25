// Ported from AmityUiKitWeb v4/chat/constants/errorResponse.
// Raw SDK error-message substrings used to map a thrown error to a friendly,
// localized toast when creating a message.

export const ERROR_RESPONSE = Object.freeze({
  CONTAIN_BLOCKED_WORD: 'Amity SDK (400308): Text contain blocked word',
  NOT_INCLUDE_WHITELIST_LINK: 'Data contain link that is not in whitelist',
  USER_MUTED: 'Amity SDK (400302): User is muted',
});

// Numeric SDK error codes, matched with `String.includes` against a thrown
// error's message. Web keeps the same map in `~/v4/chat/constants`; this used to
// be inlined in useMessageComposer, and moved here when the report flow needed
// NOT_FOUND too (a deleted message is reported as 400400 by flagMessage).
export const ERROR_CODE = Object.freeze({
  MESSAGE_TOO_LONG: '400000',
  BLOCKED_WORD: '400308',
  IMAGE_NUDITY: '400314',
  NOT_FOUND: '400400',
});
