import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      gap: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 100,
    },
    nameContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    displayName: {
      flexShrink: 1,
    },
  });

  return { styles, theme };
};
