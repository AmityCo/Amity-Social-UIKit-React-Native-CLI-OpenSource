// Styles for UserList — ported from AmityUiKitWeb
// v4/chat/features/conversation/create/components/UserList/UserList.module.css.
// The web list is a simple flex column; RN uses a FlatList that fills its parent.

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    userList: {
      flex: 1,
    },
  });

  return { styles };
};
