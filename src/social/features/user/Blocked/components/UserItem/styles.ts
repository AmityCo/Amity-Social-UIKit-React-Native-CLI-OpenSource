import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      height: 56,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.background,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 40,
    },
    nameContainer: {
      gap: 4,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    displayName: {
      flexShrink: 1,
    },
  });

  return { styles, theme };
};
