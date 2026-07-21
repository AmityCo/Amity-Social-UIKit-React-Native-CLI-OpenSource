// Header — ported from AmityUiKitWeb
// v4/chat/features/group/add-member/components/Header. A close top bar, a search
// bar, and the SelectedUsersBar chip row.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { TopBar } from '../../../../../elements/TopBar';
import { SelectedUsersBar } from '../SelectedUsersBar';
import { SearchInput } from '../../../../../../../../core/design/molecules/SearchInput';
import { useString } from '../../../../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type HeaderProps = {
  searchValue: string;
  selectedUsers: Amity.InternalUser[];
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onRemoveUser: (userId: string) => void;
};

// 4. Named function component
export function Header({
  searchValue,
  selectedUsers,
  onClose,
  onSearchChange,
  onRemoveUser,
}: HeaderProps) {
  const { styles } = useStyles();
  const pageTitle = useString('amity_chat_add_member_title');
  const searchPlaceholder = useString('amity_chat_search_placeholder');

  return (
    <View style={styles.header}>
      <TopBar title={pageTitle} leadingType="close" onLeading={onClose} />
      <View style={styles.searchBar}>
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          accessibilityLabel={searchPlaceholder}
        />
      </View>
      <SelectedUsersBar users={selectedUsers} onRemoveUser={onRemoveUser} />
    </View>
  );
}
