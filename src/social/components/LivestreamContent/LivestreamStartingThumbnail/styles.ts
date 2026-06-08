import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      gap: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000000',
    },
    title: {
      color: theme.colors.background,
      marginTop: 8,
    },
    description: {
      textAlign: 'center',
      color: theme.colors.background,
      opacity: 0.7,
    },
  });

  return styles;
};
