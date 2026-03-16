import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const styles = StyleSheet.create({
    chipContainer: {
      backgroundColor: theme.colors.baseShade4,
      paddingHorizontal: 6,
      borderRadius: 20,
    },
    chipText: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.base,
    },
  });
  return { styles, theme };
};
