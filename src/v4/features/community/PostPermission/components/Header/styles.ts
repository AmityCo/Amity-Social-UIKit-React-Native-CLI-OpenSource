import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const styles = StyleSheet.create({
    container: {
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
    },
  });

  return {
    theme,
    styles,
  };
};
