import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    communityNameWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 2,
    },
    categoryWrap: {
      paddingLeft: 16,
      paddingVertical: 8,
    },
    descriptionWrap: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    infoWrap: {
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    joinButtonWrap: {
      margin: 16,
    },
    pendingPostWrap: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
  });
  return styles;
};
