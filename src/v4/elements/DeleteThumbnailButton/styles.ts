import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

export const useStyles = (themeStyles: MyMD3Theme) => {
  const styles = StyleSheet.create({
    button: {
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
    },
    label: {
      color: themeStyles.colors.alert,
    },
  });

  return styles;
};
