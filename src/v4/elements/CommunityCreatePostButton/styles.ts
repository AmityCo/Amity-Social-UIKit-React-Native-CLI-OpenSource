import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  return StyleSheet.create({
    fab: {
      right: 16,
      width: 64,
      height: 64,
      bottom: 35,
      padding: 16,
      zIndex: 1000,
      borderRadius: 100,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
  });
};
