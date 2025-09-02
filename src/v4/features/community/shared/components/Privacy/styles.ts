import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const styles = StyleSheet.create({
    container: {
      paddingBottom: 16,
    },
    containerBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    optionContainer: {
      gap: 12,
      paddingHorizontal: 0,
      alignItems: 'flex-start',
    },
    labelContainer: {
      flex: 1,
      gap: 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    infoContainer: {
      gap: 2,
      flex: 1,
    },
    title: {
      color: theme.colors.base,
    },
    description: {
      flex: 1,
      color: theme.colors.baseShade1,
    },
  });

  return {
    theme,
    styles,
  };
};
