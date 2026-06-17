import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 32,
      flexDirection: 'column',
      justifyContent: 'center',
    },
    icon: {
      marginBottom: 16,
    },
    title: {
      maxWidth: 252,
      textAlign: 'center',
      color: theme.colors.baseShade3,
    },
    subtitle: {
      maxWidth: 252,
      textAlign: 'center',
      color: theme.colors.baseShade3,
    },
    signInButton: {
      marginTop: 16,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    signInText: {
      color: theme.colors.primary,
    },
  });

  return { styles, theme };
};
