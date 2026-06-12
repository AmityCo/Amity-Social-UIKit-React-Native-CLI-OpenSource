import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/AmityUIKitProvider';

export const useStyles = () => {
  const { colors } = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    square: {
      backgroundColor: colors.baseShade4,
    },
    circle: {
      backgroundColor: colors.baseShade4,
    },
    line: {
      borderRadius: 12,
      backgroundColor: colors.baseShade4,
    },
  });

  return { styles, colors };
};
