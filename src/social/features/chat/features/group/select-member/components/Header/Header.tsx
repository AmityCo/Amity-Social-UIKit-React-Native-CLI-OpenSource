// Header — select-group-member header. Ported from AmityUiKitWeb
// v4/chat/features/group/select-member/components/Header. Composes the shared
// TopBar (back + a trailing "Next" button) over a search field and the
// SelectedUsersBar strip.
//
// RN adaptations from web:
//   - RN has no `<form>`, so web's `Button.Main type="submit"` becomes a
//     `Button` (tertiary/sm — the RN analogue of web ghost/primary) wired to an
//     explicit `onNext` prop.
//   - Web's `SearchInput` molecule is reused directly.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { TopBar } from '../../../../../elements/TopBar';
import { Button } from '../../../../../../../../core/design/atoms/Button';
import { SearchInput } from '../../../../../../../../core/design/molecules/SearchInput';
import { useString } from '../../../../../../../../core/localization';
import { SelectedUsersBar } from '../SelectedUsersBar/SelectedUsersBar';
import { useStyles } from './styles';

// 3. Types
type HeaderProps = {
  searchValue: string;
  selectedUsers: Amity.User[];
  isFormValid: boolean;
  onClose: () => void;
  onNext: () => void;
  onSearchChange: (value: string) => void;
  onRemoveUser: (userId: string) => void;
};

// 4. Named function component
export function Header({
  searchValue,
  selectedUsers,
  isFormValid,
  onClose,
  onNext,
  onSearchChange,
  onRemoveUser,
}: HeaderProps) {
  const { styles } = useStyles();
  const title = useString('amity_chat_select_members_title');
  const nextLabel = useString('amity_chat_next');
  const searchPlaceholder = useString('amity_chat_search_placeholder');

  return (
    <View style={styles.header}>
      <TopBar
        title={title}
        leadingType="back"
        onLeading={onClose}
        trailing={
          <Button
            hierarchy="tertiary"
            size="sm"
            label={nextLabel}
            disabled={!isFormValid}
            onPress={onNext}
          />
        }
      />
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
