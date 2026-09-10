// UserItem — a single searchable-user row in the create-conversation list.
// Ported from AmityUiKitWeb v4/chat/features/conversation/create/components/UserItem.
//
// RN adaptations from web:
//   - Web resolves the avatar URL synchronously via `FileRepository.fileUrlWithSize`
//     from `user.avatar.fileUrl`; RN resolves it from `user.avatarFileId` through
//     the shared `useFile` hook (getFile → fileUrlWithSize).
//   - Web's `Avatar` atom → the chat `Avatar.User` element (round, size md/40).
//   - The web `BrandBadge` (shown when `user.isBrand`) has no RN design element,
//     so it is omitted.
//   - `react-aria` Button → Pressable.

// 1. React / RN imports
import { Pressable, View } from 'react-native';

// 2. Internal imports (relative)
import { Avatar } from '../../../../../elements/Avatar';
import { Typography } from '../../../../../../core/design/components/Typography';
import { Skeleton } from '../../../../../../core/design/components/Skeleton';
import useFile from '../../../../../../core/hooks/useFile';
import { useStyles } from './styles';

// 3. Types
type UserItemProps = {
  user: Amity.InternalUser;
  onPress: (user: Amity.InternalUser) => void;
};

// 4. Named function component
export function UserItem({ user, onPress }: UserItemProps) {
  const { styles } = useStyles();
  const displayName = user.displayName ?? user.userId;
  const avatarUrl = useFile({ fileId: user.avatarFileId ?? '' });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.userItem,
        pressed && styles.userItemPressed,
      ]}
      onPress={() => onPress(user)}
      accessibilityRole="button"
      accessibilityLabel={`Start chat with ${displayName}`}
    >
      <Avatar.User avatarUrl={avatarUrl} displayName={displayName} size="md" />
      <View style={styles.nameRow}>
        <Typography variant="bodyBold" style={styles.name} numberOfLines={1}>
          {displayName}
        </Typography>
      </View>
    </Pressable>
  );
}

// 5. Compound variant — loading skeleton row.
function UserItemSkeleton() {
  const { styles } = useStyles();
  return (
    <View style={styles.skeletonRow}>
      <Skeleton circle width={40} height={40} />
      <Skeleton width={140} height={10} />
    </View>
  );
}

UserItem.Skeleton = UserItemSkeleton;
