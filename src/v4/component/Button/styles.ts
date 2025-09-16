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

    buttonSmall: {
      paddingVertical: 5,
    },
    smallWithIcon: {
      gap: 4,
      paddingLeft: 8,
      paddingRight: 12,
    },
    smallOnlyIcon: {
      padding: 4,
    },
    buttonLarge: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    largeWithIcon: {
      gap: 8,
      paddingLeft: 12,
      paddingRight: 16,
    },
    largeOnlyIcon: {
      padding: 10,
    },

    buttonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    buttonPrimaryDisabled: {
      backgroundColor: theme.colors.primaryShade3,
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
    buttonInline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
    },
    buttonInlineDisabled: {
      backgroundColor: 'transparent',
      color: theme.colors.primaryShade2,
    },

    textPrimary: {
      color: 'white',
    },
    textSecondary: {
      color: theme.colors.secondary,
    },
    textInverse: {
      color: 'white',
    },

    icon: {
      width: 20,
      height: 20,
    },
  });
  return styles;
};
