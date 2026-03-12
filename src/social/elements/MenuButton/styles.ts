import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const styles = StyleSheet.create({
    filledContainer: {
      width: 32,
      height: 32,
      borderRadius: 99,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.transparentBlack,
    },
  });

  return { theme, styles };
};
