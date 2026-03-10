import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';

export const useStyle = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      padding: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      flexDirection: 'column',
    },
    title: {
      color: theme.colors.baseShade3,
      textAlign: 'center',
    },
    description: {
      color: theme.colors.baseShade3,
      textAlign: 'center',
    },
  });

  return { styles, theme };
};
