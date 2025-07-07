import { Dimensions, StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

export const useStyles = (themeStyles: MyMD3Theme) => {
  const { width } = Dimensions.get('window');

  const styles = StyleSheet.create({
    addOptionButton: {
      width: width - 62,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: themeStyles.colors.baseShade3,
    },
    addOptionLabel: {
      color: themeStyles.colors.secondary,
    },
  });

  return styles;
};
