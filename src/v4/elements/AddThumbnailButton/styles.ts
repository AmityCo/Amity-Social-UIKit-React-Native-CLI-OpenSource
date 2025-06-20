import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

export const useStyles = (themeStyles: MyMD3Theme) => {
  const styles = StyleSheet.create({
    button: {
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      color: themeStyles.colors.background,
    },
  });

  return styles;
};
