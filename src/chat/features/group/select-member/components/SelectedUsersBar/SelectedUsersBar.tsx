// SelectedUsersBar — the horizontal strip of chosen members above the user list.
// Ported from AmityUiKitWeb v4/chat/features/group/select-member/components/
// SelectedUsersBar. Renders a removable SelectedMember tile per chosen user and
// a divider below; hides entirely when nothing is selected.
//
// RN adaptations from web:
//   - Web's `overflow-x: auto` flex row → a horizontal ScrollView.

// 1. React / RN imports
import { ScrollView, View } from 'react-native';

// 2. Internal imports (relative)
import { SelectedMember } from '../../../../../features/shared/components/SelectedMember';
import { useStyles } from './styles';

// 3. Types
type SelectedUsersBarProps = {
  users: Amity.User[];
  onRemoveUser: (userId: string) => void;
};

// 4. Named function component
export function SelectedUsersBar({
  users,
  onRemoveUser,
}: SelectedUsersBarProps) {
  const { styles } = useStyles();

  if (users.length === 0) return null;

  return (
    <View style={styles.selectedUsersBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {users.map((user) => (
          <SelectedMember
            key={user.userId}
            user={user}
            onRemove={onRemoveUser}
          />
        ))}
      </ScrollView>
      <View style={styles.divider} />
    </View>
  );
}
