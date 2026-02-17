import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = (themeStyles: MyMD3Theme) => {
  const styles = StyleSheet.create({
    title: {
      color: themeStyles.colors.base,
    },
  });

  return styles;
};
