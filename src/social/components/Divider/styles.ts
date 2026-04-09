import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    divider: {
      height: 8,
      width: '100%',
      backgroundColor: theme.colors.baseShade4,
    },
  });
  return {
    styles,
    theme,
  };
};
