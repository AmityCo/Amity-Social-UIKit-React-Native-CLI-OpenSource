// Styles for MemberTabs — ported from AmityUiKitWeb MemberTabs.module.css.
// Column layout; search bar padding 0.5rem 1rem → 8/16.

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    searchBar: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
  });

  return { styles };
};
