import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    headerText: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '600',
      color: theme.colors.base,
      marginBottom: 16,
    },
  });
  return styles;
};
