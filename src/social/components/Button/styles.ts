import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonSmall: {
      borderRadius: 4,
      paddingVertical: 5,
      paddingHorizontal: 8,
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
      borderRadius: 8,
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
      borderColor: theme.isDarkTheme
        ? theme.colors.baseShade1
        : theme.colors.secondaryShade2,
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
      color: theme.isDarkTheme
        ? theme.colors.baseShade1
        : theme.colors.secondary,
    },
    textInverse: {
      color: 'white',
    },

    icon: {
      width: 20,
      height: 20,
    },
  });
  return { styles, theme };
};
