// Styles for ChatSurface. It is a pure measuring shell — the page owns the
// background — so it only claims the flex box.

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    surface: {
      flex: 1,
    },
  });

  return { styles };
};
