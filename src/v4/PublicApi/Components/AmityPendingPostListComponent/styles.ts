import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    labelContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.backgroundShade1,
    },
    scrollContainer: {
      flex: 1,
    },
    colorBase: {
      color: theme.colors.base,
    },
    colorBaseShade1: {
      color: theme.colors.baseShade1,
    },
    separator: {
      height: 8,
      backgroundColor: theme.colors.secondaryShade4,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.secondaryShade4,
      marginHorizontal: 16,
    },
    pendingPostListContainer: {
      flexGrow: 1,
      paddingBottom: bottom + 24,
    },
    pendingPostContainer: {
      paddingTop: 12,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
    },
    pendingPostAvatar: {
      width: 32,
      height: 32,
      borderRadius: 24,
    },
    pendingPostCreatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    userNameContainer: {
      gap: 2,
    },
    pendingPostContentContainer: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    actionContainer: {
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    actionButton: {
      flex: 1,
    },
    emptyContainer: {
      gap: 8,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      color: theme.colors.baseShade3,
    },
  });

  return {
    styles,
    theme,
  };
};
