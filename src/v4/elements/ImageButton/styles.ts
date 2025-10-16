import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      gap: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      padding: 4,
      borderRadius: 100,
      backgroundColor: theme.colors.backgroundShade1,
    },
  });

  return {
    theme,
    styles,
  };
};
