import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      height: 216,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    divider: {
      marginBottom: 8,
      paddingBottom: 8,
      borderBottomWidth: 8,
      borderBottomColor: theme.colors.secondaryShade4,
    },
  });
  return {
    styles,
    theme,
  };
};
