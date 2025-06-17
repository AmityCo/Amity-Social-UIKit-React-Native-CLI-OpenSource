import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';

export const useStyles = (themeStyles: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      paddingBottom: 32,
      color: themeStyles.colors.background,
    },
  });

  return styles;
};
