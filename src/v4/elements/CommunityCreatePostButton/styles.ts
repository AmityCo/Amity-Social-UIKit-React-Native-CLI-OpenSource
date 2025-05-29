import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

export const useStyle = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      gap: 12,
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
    },
    icon: {
      width: 24,
      height: 24,
      color: theme.colors.base,
    },
  });
  return styles;
};
