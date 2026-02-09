import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    formLabel: {
      color: theme.colors.base,
    },
    optional: {
      color: theme.colors.baseShade3,
    },
  });

  return styles;
};
