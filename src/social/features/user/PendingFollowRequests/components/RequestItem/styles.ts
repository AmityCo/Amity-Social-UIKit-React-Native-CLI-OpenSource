import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    userContainer: {
      gap: 12,
      paddingTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 40,
    },
    nameContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    displayName: {
      flexShrink: 1,
    },
    buttonsContainer: {
      gap: 12,
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    button: {
      flex: 1,
    },
    skeletonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
  });

  return { styles, theme };
};
