import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: 8,
    },
    contentContainer: {
      paddingBottom: bottom + 200,
    },
    skeletonContainer: {
      gap: 16,
      paddingHorizontal: 16,
    },
  });

  return {
    styles,
    theme,
  };
};
