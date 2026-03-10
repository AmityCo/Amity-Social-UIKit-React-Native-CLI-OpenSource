import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      height: 216,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 24,
    },
    title: {
      gap: 8,
    },
    divider: {
      borderBottomWidth: 8,
      borderBottomColor: theme.colors.secondaryShade4,
    },
  });
  return {
    styles,
    theme,
  };
};
