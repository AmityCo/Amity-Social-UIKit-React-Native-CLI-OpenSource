import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    userDescription__description__text: {
      color: theme.colors.base,
      fontSize: 15,
      lineHeight: 20,
    },
    seeMoreStyle: {
      color: theme.colors.primary,
    },
  });

  return styles;
};
