// Chat Avatar element — ported from AmityUiKitWeb v4/chat/elements/Avatar.
// A compound namespace exposing two variants: `Avatar.User` (round profile
// avatar with optional moderator badge) and `Avatar.GroupChat` (rounded-square
// group avatar with optional private badge).
//
// Adaptations from web (kept presentational, matching the sibling
// ConversationChatAvatar element):
//   - The web input types `Amity.User` / `Amity.File<'image'>` and the SDK read
//     `FileRepository.fileUrlWithSize(...)` are replaced by plain resolved props
//     (`avatarUrl`, `displayName`). The composing component resolves them.
//   - Web `Avatar.User` opens an in-app `ImageViewer` when `fullscreen`; RN has
//     no such component here, so that is delegated to the caller via `onPress`.
// The User image/text frame reuses the base Avatar atom; the deleted state and
// the whole GroupChat variant are built directly with View/Image.

// 1. React / RN imports
import { View, Image } from 'react-native';

// 2. Internal imports (relative)
import { Avatar as AvatarAtom } from '../../../core/design/atoms/Avatar';
import { ModeratorBadge } from '../../../core/design/elements/ModeratorBadge';
import { PrivateBadge } from '../../../core/design/elements/PrivateBadge';
import { AmityIcon } from '../../../core/design/icons';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';
import { useStyles } from './styles';

// 3. Types
export type AvatarUserProps = {
  /** Resolved avatar image URL (replaces the web SDK read). */
  avatarUrl?: string;
  /** Display name; drives the text-fallback initial. */
  displayName?: string;
  /** Render the deleted-user placeholder (solid user glyph) instead. */
  isDeleted?: boolean;
  /** Show the moderator badge (hidden for deleted users, as on web). */
  isModerator?: boolean;
  size?: 'sm' | 'md';
  /** Press handler — replaces web `fullscreen`/ImageViewer, delegated to caller. */
  onPress?: () => void;
};

export type AvatarGroupChatProps = {
  /** Resolved group avatar image URL (replaces the web SDK read). */
  avatarUrl?: string;
  /** When explicitly `false`, shows the private badge. */
  isPublic?: boolean;
  size?: 'sm' | 'lg';
  variant?: 'default' | 'banned';
};

// Frame box per User size — web: md 2.5rem = 40, sm 2rem = 32
// (both are SoT geometry.avatarIcon.avatar.sizes).
const USER_SIZE: Record<NonNullable<AvatarUserProps['size']>, 32 | 40> = {
  sm: 32,
  md: 40,
};

// Deleted-user glyph size — web renders the icon at 60% of the frame; rounded to
// the nearest SoT geometry.avatarIcon.icon.sizes value (md 40*0.6->24, sm 32*0.6->20).
const USER_DELETED_ICON: Record<
  NonNullable<AvatarUserProps['size']>,
  20 | 24
> = {
  sm: 20,
  md: 24,
};

// GroupChat placeholder glyph size — web: sm 1rem = 16, lg 3rem = 48
// (both are SoT geometry.avatarIcon.icon.sizes).
// PDT-3912 (web b5df56286): the group-chat placeholder glyph went 1rem→1.75rem.
// Web sizes it with a single rule for both avatar sizes; only `sm` appears in the
// chat list, so `lg` keeps its own larger glyph.
const GROUP_ICON: Record<NonNullable<AvatarGroupChatProps['size']>, 28 | 48> = {
  sm: 28,
  lg: 48,
};

// 4. Variant components
function User({
  avatarUrl,
  displayName,
  isDeleted = false,
  isModerator = false,
  size = 'md',
  onPress,
}: AvatarUserProps) {
  const { styles } = useStyles();
  const framePx = USER_SIZE[size];

  if (isDeleted) {
    return (
      <View style={[styles.userDeleted, { width: framePx, height: framePx }]}>
        <AmityIcon
          name="user-s"
          size={USER_DELETED_ICON[size]}
          tokenColor={AmityColorToken.IconAvatarDefault}
        />
      </View>
    );
  }

  const name = displayName ?? '';
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <AvatarAtom
      variant={avatarUrl ? 'image' : 'text'}
      shape="rounded"
      size={framePx}
      imageUrl={avatarUrl}
      initials={initial}
      indicator={isModerator ? <ModeratorBadge /> : undefined}
      onPress={onPress}
    />
  );
}

function GroupChat({
  avatarUrl,
  isPublic,
  size = 'sm',
  variant = 'default',
}: AvatarGroupChatProps) {
  const { styles } = useStyles();
  const isBanned = variant === 'banned';
  const imageUrl = !isBanned ? avatarUrl : undefined;
  const isPrivate = !isBanned && isPublic === false;
  // Web: default badge offset -0.125rem (-2); lg offset 0.25rem (4).
  const badgeOffset = size === 'lg' ? 4 : -2;

  return (
    <View style={styles.groupChat}>
      <View style={styles.groupChatImageWrapper}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.groupChatImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.groupChatPlaceholder}>
            <AmityIcon
              name="comments-alt-s"
              size={GROUP_ICON[size]}
              tokenColor={AmityColorToken.IconAvatarDefault}
            />
          </View>
        )}
      </View>
      {isPrivate && (
        <View
          style={[
            styles.privateBadge,
            { bottom: badgeOffset, right: badgeOffset },
          ]}
        >
          <PrivateBadge size={size === 'lg' ? 32 : 16} border />
        </View>
      )}
    </View>
  );
}

// 5. Compound namespace — mirrors the web `Avatar = { User, GroupChat }` API.
export const Avatar = { User, GroupChat };
