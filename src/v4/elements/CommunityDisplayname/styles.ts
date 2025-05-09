import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 2,
      alignItems: 'center',
      marginBottom: 4,
    },
    displayName: {
      color: theme.colors.base,
      flexShrink: 1,
    },
  });
  return styles;
};
