// SelectedUsersBar — ported from AmityUiKitWeb
// v4/chat/features/group/select-member/components/SelectedUsersBar. A horizontal
// scroller of chosen-member tiles, reusing the shared RN `SelectedMember`
// element. Renders nothing when no users are selected (as on web).

// 1. React / RN imports
import { ScrollView, View } from 'react-native';

// 2. Internal imports
import { SelectedMember } from '../../../../../features/shared/components/SelectedMember';
import { useStyles } from './styles';

// 3. Types
type SelectedUsersBarProps = {
  users: Amity.InternalUser[];
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
    <View style={styles.container}>
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
    </View>
  );
}
