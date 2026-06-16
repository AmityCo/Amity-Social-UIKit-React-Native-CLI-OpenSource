import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      gap: 16,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.base,
    },
    headerButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerSpacer: {
      width: 32,
      height: 32,
    },
    tabList: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    listContent: {
      gap: 8,
      padding: 16,
    },
  });

  return { styles, theme };
};
