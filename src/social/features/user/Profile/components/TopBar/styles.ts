import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      gap: 8,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
    },
    displayName: {
      flex: 1,
      textAlign: 'center',
    },
  });

  return { styles, theme };
};
