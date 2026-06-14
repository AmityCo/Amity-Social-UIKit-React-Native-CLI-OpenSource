import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      gap: 8,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
    },
    cancelButton: {
      minWidth: 56,
      alignItems: 'flex-start',
    },
    cancelLabel: {
      color: theme.colors.base,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.base,
    },
    dummy: {
      minWidth: 56,
    },
  });

  return { styles, theme };
};
