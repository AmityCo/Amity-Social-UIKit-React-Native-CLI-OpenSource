import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    alertText: {
      color: theme.colors.alert,
    },
  });

  return {
    styles,
    theme,
  };
};
