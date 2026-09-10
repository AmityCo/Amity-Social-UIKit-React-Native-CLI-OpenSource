// AddGroupMember — ported from AmityUiKitWeb v4/chat/features/group/add-member.
// Feature entry: a Header (close + search + selected chips), a multi-select
// UserList, and a pinned submit button. `channelId` mirrors web's page prop;
// `onClose` is an optional navigation callback supplied by the hosting page.
//
// Web wrapped the list in a react-hook-form `Controller`; the RN hook already
// exposes the watched `selectedUsers` + `setSelectedUsers`, so the list binds to
// those directly (a form re-renders on watch), and the submit button calls the
// hook's `handleAddMember` instead of a native form submit.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Header } from './components/Header';
import { AddMemberButton } from './components/AddMemberButton';
import { UserList } from './components/UserList';
import { useAddGroupMember } from './hooks/useAddGroupMember';
import { useStyles } from './styles';

// 3. Types
export type AddGroupMemberProps = {
  channelId: string;
  onClose?: () => void;
};

// 4. Named function component
export function AddGroupMember({ channelId, onClose }: AddGroupMemberProps) {
  const { styles } = useStyles();
  const {
    searchText,
    debouncedText,
    selectedUsers,
    setSearchText,
    setSelectedUsers,
    removeUser,
    handleClose,
    handleAddMember,
    isFormValid,
  } = useAddGroupMember({ channelId, onClose });

  return (
    <View style={styles.addGroupMember}>
      <Header
        searchValue={searchText}
        selectedUsers={selectedUsers}
        onClose={handleClose}
        onSearchChange={setSearchText}
        onRemoveUser={removeUser}
      />
      <View style={styles.list}>
        <UserList
          searchText={debouncedText}
          selectedUsers={selectedUsers}
          onChange={setSelectedUsers}
        />
      </View>
      <AddMemberButton isDisabled={!isFormValid} onSubmit={handleAddMember} />
    </View>
  );
}
