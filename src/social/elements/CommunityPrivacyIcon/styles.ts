import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      padding: 8,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.baseShade4,
    },
  });

  return {
    theme,
    styles,
  };
};
