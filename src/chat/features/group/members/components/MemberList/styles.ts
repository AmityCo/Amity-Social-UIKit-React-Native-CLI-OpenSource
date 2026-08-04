// Styles for MemberList — ported from AmityUiKitWeb MemberList.module.css.
// The web list is a flex column; RN uses a FlatList that fills its parent.

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    memberList: {
      flex: 1,
    },
    actionButton: {
      padding: 4,
    },
  });

  return { styles };
};
