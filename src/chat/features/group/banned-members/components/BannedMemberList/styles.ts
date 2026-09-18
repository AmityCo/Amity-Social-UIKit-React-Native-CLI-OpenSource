// Styles for BannedMemberList. The FlatList fills its parent; the unban action
// renders in the global bottom sheet, whose drawer Menu rows carry no
// horizontal padding, so the sheet wrapper adds the 16px inset and a bottom
// inset — the same wrapper the member-list action sheet uses.

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    bannedMemberList: {
      flex: 1,
    },
    actionButton: {
      padding: 4,
    },
    sheetContainer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
  });

  return { styles };
};
