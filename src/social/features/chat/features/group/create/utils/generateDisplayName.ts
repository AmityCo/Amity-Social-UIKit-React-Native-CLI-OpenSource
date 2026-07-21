// generateDisplayName — builds a default group display name from its members'
// display names, comma-joined and capped at MAX_LENGTH. Ported verbatim from
// AmityUiKitWeb v4/chat/features/group/create/utils/generateDisplayName; only the
// `resolveString` import path is adapted to the RN core/localization barrel.

import { resolveString } from '../../../../../../../core/localization';

const MAX_LENGTH = 100;

export function generateDisplayName(users: Amity.User[]): string {
  if (users.length === 0) return '';

  let buffer = '';
  let isFirst = true;

  for (const user of users) {
    const displayName =
      user.displayName ?? resolveString('amity_chat_unknown_user');
    if (!isFirst) {
      if (buffer.length + 2 + displayName.length > MAX_LENGTH) break;
      buffer += ', ';
    } else {
      isFirst = false;
    }

    if (buffer.length + displayName.length <= MAX_LENGTH) {
      buffer += displayName;
    } else {
      const remaining = MAX_LENGTH - buffer.length;
      if (remaining > 0) buffer += displayName.slice(0, remaining);
      break;
    }
  }

  return buffer;
}
