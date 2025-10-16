import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    labelContainer: {
      gap: 2,
      flex: 1,
    },
    switchContainer: {
      gap: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    colorBase: {
      color: theme.colors.base,
    },
    colorBaseShade1: {
      color: theme.colors.baseShade1,
    },
  });

  return {
    styles,
    theme,
  };
};
