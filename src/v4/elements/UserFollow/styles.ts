import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    textComponent: {
      color: theme.colors.baseShade2,
    },
    amountTextComponent: {
      color: theme.colors.base,
    },
    userFollow__container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      alignItems: 'center',
    },
  });

  return styles;
};
