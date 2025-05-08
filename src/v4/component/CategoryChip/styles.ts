import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 8,
      paddingLeft: 4,
      paddingRight: 12,
      paddingVertical: 4,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.baseShade4,
      alignItems: 'center',
    },
    categoryImagePlaceholder: {
      width: 28,
      height: 28,
      borderRadius: 100,
      backgroundColor: theme.colors.primaryShade2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryImage: {
      width: 28,
      height: 28,
      borderRadius: 100,
    },
    categoryName: {
      color: theme.colors.base,
    },
  });
  return styles;
};
