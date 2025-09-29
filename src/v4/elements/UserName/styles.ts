import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    userName__displayName__container: {
      maxWidth: '100%',
      flexShrink: 1,
    },
    userName__displayName__text: {
      color: theme.colors.base,
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 24,
    },
    seeMoreStyle: {
      color: theme.colors.primary,
    },
  });

  return styles;
};
