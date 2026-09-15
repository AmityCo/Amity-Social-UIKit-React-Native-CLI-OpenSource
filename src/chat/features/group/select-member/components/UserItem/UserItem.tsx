// UserItem — a single selectable-user row in the select-group-member list.
// Ported from AmityUiKitWeb v4/chat/features/group/select-member/components/UserItem.
//
// RN adaptations from web:
//   - Web resolves the avatar synchronously via `FileRepository.fileUrlWithSize`
//     from `user.avatar.fileUrl`; RN resolves `user.avatarFileId` through the
//     shared `useFile` hook, mirroring the conversation/create UserItem.
//   - Web's core `Avatar` atom → the chat `Avatar.User` element (round, size md).
//   - The web `BrandBadge` (shown when `user.isBrand`) has no RN design element,
//     so it is omitted (same decision as the conversation/create UserItem).
//   - Web renders no press handler here — the row's selection is owned by the
//     wrapping `Selection.Checkbox`, so this component is purely presentational.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Avatar } from '../../../../../elements/Avatar';
import { Typography } from '../../../../../../core/design/components/Typography';
import { Skeleton } from '../../../../../../core/design/components/Skeleton';
import useFile from '../../../../../../core/hooks/useFile';
import { useStyles } from './styles';

// 3. Types
type UserItemProps = {
  user: Amity.User;
};

// 4. Named function component
export function UserItem({ user }: UserItemProps) {
  const { styles } = useStyles();
  const displayName = user.displayName ?? user.userId;
  const avatarUrl = useFile({ fileId: user.avatarFileId ?? '' });

  return (
    <View style={styles.userItem}>
      <Avatar.User avatarUrl={avatarUrl} displayName={displayName} size="md" />
      <View style={styles.nameRow}>
        <Typography variant="bodyBold" style={styles.name} numberOfLines={1}>
          {displayName}
        </Typography>
      </View>
    </View>
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
