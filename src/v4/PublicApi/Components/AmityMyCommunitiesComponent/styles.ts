import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    listSkeleton: {
      marginTop: 16,
      paddingHorizontal: 16,
    },
    list: {
      flex: 1,
      marginTop: 16,
    },
    listContent: {
      paddingHorizontal: 16,
      gap: 16,
    },
    emptyContainer: {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitleText: {
      color: theme.colors.baseShade3,
    },
    emptyDescriptionText: {
      color: theme.colors.baseShade3,
    },
    createCommunityButton: {
      marginTop: 17,
    },
    createCommunityButtonText: {
      color: 'white',
    },
  });

  return styles;
};
