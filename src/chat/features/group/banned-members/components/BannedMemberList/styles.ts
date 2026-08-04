// Styles for BannedMemberList — ported from AmityUiKitWeb BannedMemberList.module.css.
// FlatList fills its parent; the trailing action popover uses the shared menu padding.

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    bannedMemberList: {
      flex: 1,
    },
    actionButton: {
      padding: 4,
    },
    menuContainer: {
      padding: 4,
    },
  });

  return { styles };
};
