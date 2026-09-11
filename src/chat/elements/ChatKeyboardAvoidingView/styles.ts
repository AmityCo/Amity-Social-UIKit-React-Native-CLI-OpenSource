// Styles for ChatKeyboardAvoidingView. The component is a pure layout shell —
// the page wrapper owns the background colour — so it only claims the flex box.

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  return { styles };
};
