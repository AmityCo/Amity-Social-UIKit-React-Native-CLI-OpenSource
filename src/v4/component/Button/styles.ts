import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    },
    // Size styles
    buttonSmall: {
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    buttonLarge: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    // Colors styles
    buttonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.secondaryShade3,
      borderWidth: 1,
    },
    buttonInverse: {
      backgroundColor: 'transparent',
      borderColor: 'white',
      borderWidth: 1,
    },
    // Text styles
    textPrimary: {
      color: 'white',
    },
    textSecondary: {
      color: theme.colors.secondary,
    },
    textInverse: {
      color: 'white',
    },
    // Icon styles
    icon: {
      marginRight: 8,
      width: 20,
      height: 20,
    },
  });
  return styles;
};
