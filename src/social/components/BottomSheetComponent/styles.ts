import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = ({ dark }: { dark?: boolean } = {}) => {
  const theme = useTheme<MyMD3Theme>();
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: dark ? '#191919' : theme.colors.background,
      paddingBottom: bottom,
    },
  });

  return {
    theme,
    styles,
  };
};
