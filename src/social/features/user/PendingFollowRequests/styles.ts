import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    banner: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.backgroundShade1,
    },
    bannerText: {
      color: theme.colors.baseShade1,
    },
  });

  return { styles, theme };
};
