import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flex: 1,
      paddingBottom: bottom + 120,
    },
    labelContainer: {
      gap: 2,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    colorBase: {
      color: theme.colors.base,
    },
    colorBaseShade1: {
      color: theme.colors.baseShade1,
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
