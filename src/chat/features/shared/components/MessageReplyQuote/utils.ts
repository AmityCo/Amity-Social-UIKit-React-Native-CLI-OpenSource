// Helpers for MessageReplyQuote — ported from web chat/utils/getReplyHeader.ts
// and getReplyThumbnailSize.ts. Kept local to the component (depth-7 import
// parity). getReplyHeader builds the "X replied to Y" line via resolveString
// (non-hook, matching web); getReplyThumbnailSize returns clamped media
// dimensions in rem (multiply by 16 for px in RN).

import { resolveString } from '../../../../../core/localization';

type GetReplyHeaderParams = {
  child: Amity.Message;
  /**
   * Absent when the parent could not be resolved at all — see the
   * deleted/unavailable branch below (PDT-4927).
   */
  parent?: Amity.Message | null;
  currentUserId?: string | null;
  isGroupChat: boolean;
};

function getDisplayName(message: Amity.Message): string {
  const name = (message as unknown as { creator?: { displayName?: string } })
    .creator?.displayName;
  return name && name.length > 0
    ? name
    : resolveString('amity_chat_unknown_user');
}

export function getReplyHeader({
  child,
  parent,
  currentUserId,
  isGroupChat,
}: GetReplyHeaderParams): string {
  const isCurrentUser = !!currentUserId && child.creatorId === currentUserId;

  // A deleted parent and a parent that cannot be fetched at all (PDT-4927 —
  // the live object settled with no message) share this header: there is no
  // separate copy for the latter, and to the reader both mean the same thing,
  // that the message being replied to can no longer be shown.
  if (!parent || parent.isDeleted === true) {
    return isCurrentUser
      ? resolveString('amity_chat_reply_you_to_deleted')
      : resolveString('amity_chat_reply_to_deleted');
  }

  const isParentCurrentUser =
    !!currentUserId && parent.creatorId === currentUserId;

  if (!isGroupChat) {
    if (isParentCurrentUser) {
      return isCurrentUser
        ? resolveString('amity_chat_reply_you_to_yourself')
        : resolveString('amity_chat_reply_to_you');
    }
    return isCurrentUser
      ? resolveString('amity_chat_reply_you')
      : resolveString('amity_chat_reply_to_themself');
  }

  const childName = getDisplayName(child);
  const parentName = getDisplayName(parent);

  if (isParentCurrentUser) {
    return isCurrentUser
      ? resolveString('amity_chat_reply_you_to_yourself')
      : resolveString('amity_chat_reply_name_to_you', childName);
  }
  if (isCurrentUser) {
    return resolveString('amity_chat_reply_you_to_name', parentName);
  }
  if (parent.creatorId === child.creatorId) {
    return resolveString('amity_chat_reply_name_to_themself', childName);
  }
  return resolveString('amity_chat_reply_name_to_name', childName, parentName);
}

const MAX_AXIS_REM = 7.5;
const MIN_AXIS_REM = 2.5;
const RATIO_THRESHOLD = 3;

export type ReplyThumbnailSize = {
  widthRem: number;
  heightRem: number;
};

export function getReplyThumbnailSize(
  intrinsicWidth: number,
  intrinsicHeight: number
): ReplyThumbnailSize {
  if (intrinsicWidth <= 0 || intrinsicHeight <= 0) {
    return { widthRem: MAX_AXIS_REM, heightRem: MAX_AXIS_REM };
  }
  if (intrinsicHeight >= intrinsicWidth) {
    const heightRem = MAX_AXIS_REM;
    const ratio = intrinsicHeight / intrinsicWidth;
    const widthRem =
      ratio > RATIO_THRESHOLD ? MIN_AXIS_REM : MAX_AXIS_REM / ratio;
    return { widthRem, heightRem };
  }
  const widthRem = MAX_AXIS_REM;
  const ratio = intrinsicWidth / intrinsicHeight;
  const heightRem =
    ratio > RATIO_THRESHOLD ? MIN_AXIS_REM : MAX_AXIS_REM / ratio;
  return { widthRem, heightRem };
}
