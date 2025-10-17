import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

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
