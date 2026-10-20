import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    slot: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    leftSlot: {
      justifyContent: 'flex-start',
    },
    centerSlot: {
      // Wide enough for "Report reason" without pushing the side slots out.
      flex: 2,
      justifyContent: 'center',
    },
    rightSlot: {
      justifyContent: 'flex-end',
    },
    title: {
      textAlign: 'center',
    },
  });

  return { styles, theme };
};
