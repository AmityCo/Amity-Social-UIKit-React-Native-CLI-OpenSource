// CreateConversation — entry component for the create-conversation flow.
// Ported from AmityUiKitWeb v4/chat/features/conversation/create/CreateConversation.
// Composes the Header (title + search) over the searchable UserList; selecting a
// user creates a 1:1 conversation channel and navigates into it.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Header } from './components/Header/Header';
import { UserList } from './components/UserList/UserList';
import { useCreateConversation } from './hooks/useCreateConversation';
import { useStyles } from './styles';

// 3. Named function component
export function CreateConversation() {
  const { styles } = useStyles();
  const {
    searchText,
    setSearchText,
    debouncedText,
    handleSelectUser,
    handleClose,
  } = useCreateConversation();

  return (
    <View style={styles.createConversation}>
      <Header
        onClose={handleClose}
        searchValue={searchText}
        onSearchChange={setSearchText}
      />
      <UserList searchText={debouncedText} onSelectUser={handleSelectUser} />
    </View>
  );
}
