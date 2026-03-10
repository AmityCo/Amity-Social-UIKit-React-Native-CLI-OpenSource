import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      paddingHorizontal: 16,
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundShade1,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    textContainer: {
      gap: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: theme.colors.base,
    },
    subtitle: {
      color: theme.colors.baseShade2,
    },
  });

  return { styles, theme };
};
