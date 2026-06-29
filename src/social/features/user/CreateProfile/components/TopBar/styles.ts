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
    title: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.base,
    },
    dummy: {
      width: 24,
      height: 24,
    },
  });

  return { styles, theme };
};
