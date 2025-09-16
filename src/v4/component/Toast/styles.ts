import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    toast: {
      gap: 12,
      zIndex: 999,
      width: '90%',
      borderRadius: 8,
      bottom: bottom + 16,
      paddingVertical: 16,
      alignSelf: 'center',
      flexDirection: 'row',
      position: 'absolute',
      alignItems: 'center',
      paddingHorizontal: 12,
      backgroundColor: theme.colors.base,
    },
    message: {
      flex: 1,
      color: theme.colors.background,
    },
  });

  return {
    theme,
    styles,
  };
};
