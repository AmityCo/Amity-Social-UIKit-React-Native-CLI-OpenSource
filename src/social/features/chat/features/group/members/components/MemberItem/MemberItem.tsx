// MemberItem — ported from AmityUiKitWeb
// v4/chat/features/group/members/components/MemberItem.
//
// A single member row: avatar (with moderator badge) + display name, an optional
// "you" suffix, a read-only muted indicator (shown to moderators), and a trailing
// action-menu slot. Web rendered its own `ActionMenu` from a `getActions` array;
// RN keeps the slot generic via the `trailing` prop so both the members list
// (which passes AmityGroupMemberActionComponent) and the banned list (which
// passes a small unban menu) reuse this row — matching web's shared usage.
//
// RN adaptations: web read the avatar synchronously from the SDK; RN resolves
// `avatarFileId` through `useFile`. Web `BrandBadge` has no RN element and is
// dropped (as in the create UserItem).

// 1. React / RN imports
import { type ReactNode } from 'react';
import { View } from 'react-native';

// 2. Internal imports
import { Avatar } from '../../../../../elements/Avatar';
import { Typography } from '../../../../../../../../core/design/components/Typography';
import { Skeleton } from '../../../../../../../../core/design/components/Skeleton';
import { AmityIcon } from '../../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../../core/localization';
import useFile from '../../../../../../../../core/hooks/useFile';
import { useStyles } from './styles';

// 3. Types
type MemberItemProps = {
  user: Amity.InternalUser;
  isModerator: boolean;
  isCurrentUser: boolean;
  isMuted?: boolean;
  isViewerModerator?: boolean;
  trailing?: ReactNode;
};

// 4. Named function component
export function MemberItem({
  user,
  isModerator,
  isCurrentUser,
  isMuted = false,
  isViewerModerator = false,
  trailing,
}: MemberItemProps) {
  const { styles } = useStyles();
  const displayName = user.displayName ?? user.userId;
  const youSuffix = useString('amity_chat_member_you_suffix');
  const avatarUrl = useFile({ fileId: user.avatarFileId ?? '' });

  return (
    <View style={styles.memberItem}>
      <Avatar.User
        avatarUrl={avatarUrl}
        displayName={displayName}
        size="md"
        isModerator={isModerator}
      />
      <View style={styles.nameRow}>
        <Typography variant="bodyBold" style={styles.name} numberOfLines={1}>
          {displayName}
        </Typography>
        {isCurrentUser ? (
          <Typography variant="bodyBold" style={styles.youSuffix}>
            {youSuffix}
          </Typography>
        ) : null}
        {isViewerModerator && isMuted ? (
          <AmityIcon
            name="volume-slash-r"
            size={20}
            tokenColor={AmityColorToken.TextListTextDescriptionDefaultDefault}
          />
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

// 5. Compound variant — loading skeleton row.
function MemberItemSkeleton() {
  const { styles } = useStyles();
  return (
    <View style={styles.skeletonRow}>
      <Skeleton circle width={40} height={40} />
      <Skeleton width={140} height={10} />
    </View>
  );
}

MemberItem.Skeleton = MemberItemSkeleton;
