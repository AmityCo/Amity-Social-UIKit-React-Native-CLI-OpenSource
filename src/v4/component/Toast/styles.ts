import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = (bottomPosition: number = 16) => {
  const theme = useTheme<MyMD3Theme>();
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    toast: {
      gap: 12,
      zIndex: 999,
      width: '90%',
      borderRadius: 8,
      bottom: bottom + bottomPosition,
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
