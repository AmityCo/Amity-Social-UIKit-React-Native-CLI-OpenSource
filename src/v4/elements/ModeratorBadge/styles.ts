import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      padding: 4,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryShade3,
    },
  });

  return {
    theme,
    styles,
  };
};
