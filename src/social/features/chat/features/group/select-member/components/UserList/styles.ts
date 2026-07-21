// Styles for the select-group-member UserList — ported from AmityUiKitWeb
// v4/chat/features/group/select-member/components/UserList/UserList.module.css.
// The web list is a flex column; RN uses a FlatList that fills its parent.

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    userList: {
      flex: 1,
    },
  });

  return { styles };
};
