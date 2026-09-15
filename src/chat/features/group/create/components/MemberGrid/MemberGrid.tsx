// MemberGrid — the "Members" section of the create-group screen. Ported from
// AmityUiKitWeb v4/chat/features/group/create/components/MemberGrid. Shows a
// heading over a wrapping grid of tiles: an AddTile, the current user's YouTile,
// and a removable SelectedMember tile per chosen member.
//
// RN adaptations from web:
//   - Web's `AddTile` `ariaLabel`/`onPress` → RN `accessibilityLabel`/`onPress`.
//   - CSS grid (repeat(4, 4rem) + space-between) → a wrapping flex row.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../../../core/design/components/Typography';
import { useString } from '../../../../../../core/localization';
import { AddTile } from '../../../../../features/shared/components/AddTile';
import { SelectedMember } from '../../../../../features/shared/components/SelectedMember';
import { YouTile } from '../../../../../features/shared/components/YouTile';
import { useStyles } from './styles';

// 3. Types
type MemberGridProps = {
  currentUser: Amity.User | null | undefined;
  members: Amity.User[];
  onAddMember: () => void;
  onRemoveMember: (userId: string) => void;
};

// 4. Named function component
export function MemberGrid({
  currentUser,
  members,
  onAddMember,
  onRemoveMember,
}: MemberGridProps) {
  const { styles } = useStyles();
  const memberLabel = useString('amity_chat_group_members');
  const addMemberLabel = useString('amity_chat_add_member_chip');

  return (
    <View style={styles.memberGrid}>
      <Typography variant="titleBold" style={styles.heading}>
        {memberLabel}
      </Typography>
      <View style={styles.list}>
        <AddTile
          onPress={onAddMember}
          accessibilityLabel={addMemberLabel}
          label={addMemberLabel}
        />
        {currentUser && <YouTile user={currentUser} />}
        {members.map((user) => (
          <SelectedMember
            key={user.userId}
            user={user}
            onRemove={onRemoveMember}
          />
        ))}
      </View>
    </View>
  );
}
