import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 44,
      width: '100%',
      paddingHorizontal: 16,
      paddingVertical: 13,
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    button: {
      width: 32,
      height: 32,
      borderRadius: 99,
      backgroundColor: theme.colors.transparentBlack,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonIcon: {
      width: 24,
      height: 24,
      tintColor: 'white',
    },
  });

  return { styles };
};
