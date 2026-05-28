import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    img: {
      width: 32,
      height: 32,
      borderRadius: 32,
    },
    placeholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryShade2,
    },
    avatarPlaceholderText: {
      color: theme.colors.background,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      textAlignVertical: 'center',
      includeFontPadding: false,
      padding: 0,
      margin: 0,
    },
  });

  return { styles, theme };
};
