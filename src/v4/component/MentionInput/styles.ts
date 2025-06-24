import { StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const { width } = useWindowDimensions();

  const styles = StyleSheet.create({
    mentionListContainer: {
      width: width,
      maxHeight: 170,
      top: 0,
      backgroundColor: 'transparent',
    },
    mentionText: {
      color: theme.colors.primary,
      fontSize: 15,
    },
    inputText: {
      padding: 0,
      fontSize: 15,
      color: theme.colors.base,
    },
  });

  return {
    theme,
    styles,
  };
};
