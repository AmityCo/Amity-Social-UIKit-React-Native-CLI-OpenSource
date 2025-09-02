import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    addButton: {
      gap: 4,
      alignItems: 'center',
      paddingHorizontal: 12,
      width: '20%',
    },
    addButtonIconContainer: {
      padding: 8,
      borderRadius: 100,
      backgroundColor: theme.colors.secondaryShade4,
    },
    addButtonLabel: {
      color: theme.colors.base,
    },
  });

  return {
    theme,
    styles,
  };
};
