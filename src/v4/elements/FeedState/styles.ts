import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme, width: number) => {
  return StyleSheet.create({
    feedStateContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: width * 0.3,
    },
    title: {
      marginTop: 8,
      color: theme.colors.baseShade3,
    },
    subTitle: {
      marginTop: 0,
      color: theme.colors.baseShade3,
    },
    feedStateIcon: {
      width: 60,
      height: 60,
      color: theme.colors.secondaryShade4,
    },
  });
};
