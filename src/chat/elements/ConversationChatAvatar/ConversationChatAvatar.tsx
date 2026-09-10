// ConversationChatAvatar element — ported from AmityUiKitWeb
// v4/chat/elements/ConversationChatAvatar.
// Renders a 1:1 conversation avatar for the resolved "other" member:
// composes the base Avatar atom with an optional ModeratorBadge indicator.
//
// The web version types its input as `Amity.User` and resolves the image URL
// via the SDK's `FileRepository.fileUrlWithSize(...)`. To keep this element
// presentational, those SDK reads are replaced by plain props: the composing
// component picks the other member and passes an already-resolved `avatarUrl`
// and `displayName`.

// 1. React / RN imports
import { type ReactNode } from 'react';

// 2. Internal imports (relative)
import { Avatar } from '../../../core/design/atoms/Avatar';
import { ModeratorBadge } from '../../../core/design/elements/ModeratorBadge';

// 3. Types
export type ConversationChatAvatarProps = {
  /** Resolved avatar image URL of the other member (replaces the web SDK read). */
  avatarUrl?: string;
  /** Display name of the other member; drives the text-fallback initials. */
  displayName?: string;
  /** Render the deleted-user placeholder (user icon) instead of the member. */
  isDeleted?: boolean;
  /** Show the moderator badge indicator. */
  isModerator?: boolean;
};

// 4. Named function component
export function ConversationChatAvatar({
  avatarUrl,
  displayName,
  isDeleted,
  isModerator,
}: ConversationChatAvatarProps) {
  const indicator: ReactNode = isModerator ? <ModeratorBadge /> : undefined;

  if (isDeleted) {
    return (
      <Avatar variant="icon" shape="rounded" size={40} indicator={indicator} />
    );
  }

  if (!displayName && !avatarUrl) return null;

  const name = displayName ?? '';
  const initials = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <Avatar
      variant={avatarUrl ? 'image' : 'text'}
      shape="rounded"
      size={40}
      imageUrl={avatarUrl}
      initials={initials}
      indicator={indicator}
    />
  );
}
