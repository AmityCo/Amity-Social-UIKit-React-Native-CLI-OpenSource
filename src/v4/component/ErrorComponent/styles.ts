import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyle = (theme: MyMD3Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
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
    button: {
      alignSelf: 'center',
    },
  });
};
