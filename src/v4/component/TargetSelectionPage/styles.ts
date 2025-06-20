import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingVertical: 18,
      alignItems: 'center',
    },
    closeIcon: {
      width: 12,
      height: 12,
      tintColor: theme.colors.base,
    },
    closeButton: {
      position: 'absolute',
      left: 18,
      top: 25,
      width: 24,
      height: 24,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 22,
      color: theme.colors.base,
    },
    communityHeader: {
      color: theme.colors.baseShade3,
      marginBottom: 8,
      marginHorizontal: 16,
    },
    divider: {
      marginTop: 8,
      marginBottom: 26,
      paddingHorizontal: 16,
    },
  });

  return styles;
};
