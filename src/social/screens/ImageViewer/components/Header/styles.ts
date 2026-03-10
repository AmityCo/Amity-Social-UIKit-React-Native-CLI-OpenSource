import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const { top } = useSafeAreaInsets();
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    header: {
      paddingTop: top + 12,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    closeButton: {
      width: 24,
      height: 24,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.baseShade4,
    },
  });

  return { styles, theme };
};
