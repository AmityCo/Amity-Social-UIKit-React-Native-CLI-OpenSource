import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';
import { useTheme } from 'react-native-paper';
export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingBottom: bottom + 40,
      backgroundColor: theme.colors.background,
    },
  });

  return { styles, theme };
};
