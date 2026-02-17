import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = (themeStyles: MyMD3Theme) => {
  const styles = StyleSheet.create({
    formDescription: {
      color: themeStyles.colors.baseShade1,
    },
  });

  return styles;
};
