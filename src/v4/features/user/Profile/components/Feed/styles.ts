import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    tabsContainer: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
      paddingTop: 16,
      borderBottomColor: theme.colors.baseShade4,
      borderBottomWidth: 1,
    },
  });

  return styles;
};
