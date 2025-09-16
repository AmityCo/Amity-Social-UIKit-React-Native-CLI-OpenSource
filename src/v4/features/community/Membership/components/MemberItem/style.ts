import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

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
    },
    userName: {
      color: theme.colors.base,
    },
  });

  return {
    styles,
    theme,
  };
};
