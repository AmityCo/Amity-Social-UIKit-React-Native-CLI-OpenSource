import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = (theme: MyMD3Theme) => {
  const insets = useSafeAreaInsets();
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

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 10,
      minHeight: 200,
      paddingBottom: insets.bottom + 10,
    },
    dragHandle: {
      width: 36,
      height: 4,
      borderRadius: 12,
      marginVertical: 10,
      alignSelf: 'center',
      backgroundColor: theme.colors.baseShade3,
    },
    bottomSheetOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    bottomSheetOptionText: {
      fontSize: 16,
      color: theme.colors.onSurface,
      marginLeft: 12,
      fontWeight: '500',
    },
  });

  return styles;
};
