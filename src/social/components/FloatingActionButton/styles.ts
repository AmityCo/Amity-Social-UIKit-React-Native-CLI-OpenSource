import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      right: 16,
      zIndex: 100,
      position: 'absolute',
      bottom: 16 + insets.bottom,
    },
    button: {
      width: 64,
      height: 64,
      padding: 16,
      elevation: 6,
      borderRadius: 100,
      shadowRadius: 3.84,
      shadowOpacity: 0.5,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.base,
      backgroundColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },
  });

  return { styles, theme };
};
