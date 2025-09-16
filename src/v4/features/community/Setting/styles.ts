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
    titleContainer: {
      paddingTop: 24,
      paddingBottom: 4,
      paddingHorizontal: 16,
    },
    divider: {
      height: 1,
      marginHorizontal: 16,
      backgroundColor: theme.colors.baseShade4,
    },
  });

  return {
    styles,
    theme,
  };
};
