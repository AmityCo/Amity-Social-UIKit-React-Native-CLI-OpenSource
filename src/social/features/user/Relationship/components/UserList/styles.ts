import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      paddingTop: 8,
      paddingBottom: 16 + insets.bottom,
    },
  });

  return {
    styles,
    theme,
  };
};
