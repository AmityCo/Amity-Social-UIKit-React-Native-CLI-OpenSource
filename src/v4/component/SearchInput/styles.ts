import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      gap: 8,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 12,
      justifyContent: 'flex-start',
      backgroundColor: theme.colors.baseShade4,
    },
    input: {
      margin: 0,
      padding: 0,
      fontSize: 15,
    },
  });
  return {
    styles,
    theme,
  };
};
