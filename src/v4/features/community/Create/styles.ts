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
    contentContainer: {
      paddingBottom: 60,
    },
    allInputContainer: {
      gap: 24,
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    submitButtonContainer: {
      flex: 1,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 16,
      zIndex: 100,
      borderTopWidth: 1,
      position: 'absolute',
      paddingBottom: bottom + 16,
      borderTopColor: theme.colors.baseShade4,
      backgroundColor: theme.colors.background,
    },
  });

  return { styles, theme };
};
