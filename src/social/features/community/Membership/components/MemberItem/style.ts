import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    userContainer: {
      gap: 12,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 100,
      objectFit: 'cover',
    },
    userName: {
      color: theme.colors.base,
    },
    displayNameContainer: {
      display: 'flex',
      gap: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  return {
    styles,
    theme,
  };
};
