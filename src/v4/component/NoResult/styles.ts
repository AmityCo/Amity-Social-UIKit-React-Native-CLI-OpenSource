import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      textAlign: 'center',
      color: theme.colors.baseShade3,
    },
  });
  return {
    styles,
    theme,
  };
};
