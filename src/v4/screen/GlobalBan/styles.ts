import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    titleContainer: {
      padding: 16,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      borderBottomColor: theme.colors.baseShade4,
    },
    title: {
      color: theme.colors.base,
    },
    contentContainer: {
      gap: 8,
      flex: 1,
      paddingVertical: 24,
      alignItems: 'center',
      paddingHorizontal: 16,
      flexDirection: 'column',
      justifyContent: 'center',
    },
    body: {
      textAlign: 'center',
      color: theme.colors.baseShade2,
    },
  });

  return { styles, theme };
};
