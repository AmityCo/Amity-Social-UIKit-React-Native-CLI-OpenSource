import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyle = (theme: MyMD3Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      gap: 16,
      flexDirection: 'column',
    },
    title: {
      color: theme.colors.baseShade3,
    },
    description: {
      color: theme.colors.baseShade3,
    },
  });
};
