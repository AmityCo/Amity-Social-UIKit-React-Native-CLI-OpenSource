import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = (themeStyles: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      borderRadius: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themeStyles.colors.live,
    },
    label: {
      color: themeStyles.colors.background,
    },
  });

  return styles;
};
