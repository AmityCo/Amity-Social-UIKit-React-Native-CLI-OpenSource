import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = (themeStyles: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      height: 216,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    divider: {
      marginBottom: 8,
      paddingBottom: 8,
      borderBottomWidth: 8,
      borderBottomColor: themeStyles.colors.baseShade4,
    },
  });
  return styles;
};
