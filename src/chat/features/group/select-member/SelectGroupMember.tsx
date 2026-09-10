// SelectGroupMember — entry component for the select-group-member step of the
// create-group flow. Ported from AmityUiKitWeb
// v4/chat/features/group/select-member/SelectGroupMember. Composes the Header
// (title + Next + search + selected strip) over the searchable multi-select
// UserList; tapping Next advances to the create-group step.
//
// RN adaptations from web:
//   - Web wraps everything in a `<form onSubmit>`; RN has no form, so `handleNext`
//     is wired to the Header's Next button via `onNext`.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Third-party imports
import { Controller } from 'react-hook-form';

// 3. Internal imports (relative)
import { Header } from './components/Header/Header';
import { UserList } from './components/UserList/UserList';
import {
  useSelectGroupMember,
  type SelectGroupMemberPageProps,
} from './hooks/useSelectGroupMember';
import { useStyles } from './styles';

// 4. Named function component
export function SelectGroupMember({
  selectedGroupMember,
}: SelectGroupMemberPageProps) {
  const { styles } = useStyles();
  const {
    form,
    searchText,
    setSearchText,
    debouncedText,
    selectedUsers,
    setSelectedUsers,
    removeUser,
    isFormValid,
    handleClose,
    handleNext,
  } = useSelectGroupMember({ selectedGroupMember });

  return (
    <View style={styles.selectGroupMember}>
      <Header
        onClose={handleClose}
        onNext={handleNext}
        searchValue={searchText}
        onRemoveUser={removeUser}
        selectedUsers={selectedUsers}
        isFormValid={isFormValid}
        onSearchChange={setSearchText}
      />
      <Controller
        control={form.control}
        name="selectedUsers"
        render={({ field: { value } }) => (
          <UserList
            searchText={debouncedText}
            selectedUsers={value}
            onChange={setSelectedUsers}
          />
        )}
      />
    </View>
  );
}
