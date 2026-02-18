import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;

  const styles = StyleSheet.create({
    mentionContainer: {
      borderTopColor: theme.colors.baseShade4,
      borderTopWidth: 1,
      paddingHorizontal: 0,
      maxHeight: 240,
    },
  });

  return styles;
};
