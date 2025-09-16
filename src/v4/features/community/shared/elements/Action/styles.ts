import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    iconContainer: {
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: theme.colors.baseShade4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    labelContainer: {
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    baseShade1Text: {
      color: theme.colors.baseShade1,
    },
  });

  return { styles, theme };
};
