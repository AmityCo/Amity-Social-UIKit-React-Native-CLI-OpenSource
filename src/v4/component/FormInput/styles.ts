import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    inputContainer: {
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    labelContainer: {
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    inputLength: {
      color: theme.colors.baseShade1,
    },
    input: {
      fontSize: 15,
      color: theme.colors.base,
      padding: 0,
      margin: 0,
    },
  });

  return {
    theme,
    styles,
  };
};
