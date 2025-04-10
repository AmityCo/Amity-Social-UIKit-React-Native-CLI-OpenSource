import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    chipContainer: {
      backgroundColor: theme.colors.baseShade4,
      paddingVertical: 6,
    },
    chipText: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.base,
    },
  });
  return styles;
};
