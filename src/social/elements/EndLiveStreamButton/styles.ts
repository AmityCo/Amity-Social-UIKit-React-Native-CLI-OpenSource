import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = (themeStyles: MyMD3Theme) => {
  const styles = StyleSheet.create({
    button: {
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      paddingHorizontal: 16,
      justifyContent: 'center',
      borderColor: themeStyles.colors.secondaryShade4,
    },
    label: {
      color: themeStyles.colors.background,
    },
  });

  return styles;
};
