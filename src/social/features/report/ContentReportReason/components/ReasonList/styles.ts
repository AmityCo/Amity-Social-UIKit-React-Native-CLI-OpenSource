import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    description: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      color: theme.colors.baseShade1,
    },
    label: {
      flex: 1,
      marginRight: 12,
    },
    // Same geometry as a Radio.Option row, so "Others" lines up with the reasons.
    othersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
  });

  return { styles, theme };
};
