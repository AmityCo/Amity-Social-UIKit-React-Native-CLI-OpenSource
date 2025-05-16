import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    stickyHeaderContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
      backgroundColor: theme.colors.background,
    },
    smallHeaderNavigationWrap: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    smallHeaderCommunityTabWrap: {
      position: 'absolute',
      top: 100,
      left: 0,
      right: 0,
      zIndex: 1,
    },
  });

  return styles;
};
