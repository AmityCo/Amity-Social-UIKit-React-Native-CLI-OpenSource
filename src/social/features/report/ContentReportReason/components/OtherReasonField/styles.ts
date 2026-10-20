import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';

// Matches the FormInput field (label, "(Optional)", counter, underlined input).
export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      paddingTop: 24,
      paddingHorizontal: 16,
    },
    inputContainer: {
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    labelContainer: {
      gap: 8,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      flex: 1,
      color: theme.colors.base,
    },
    optional: {
      color: theme.colors.baseShade3,
    },
    counter: {
      color: theme.colors.baseShade1,
    },
    input: {
      fontSize: 15,
      color: theme.colors.base,
      padding: 0,
      margin: 0,
    },
    inputDisabled: {
      color: theme.colors.baseShade2,
    },
  });

  return { styles, theme };
};
