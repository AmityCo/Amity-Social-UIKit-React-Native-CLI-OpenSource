import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.backgroundShade1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: theme.colors.base,
    },
    dangerLabel: {
      color: theme.colors.alert,
    },
    content: {
      paddingBottom: 32,
    },
  });

  return { theme, styles };
};
