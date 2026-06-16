import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      paddingBottom: 16,
    },
    section: {
      gap: 16,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    sectionTitle: {
      color: theme.colors.base,
    },
    viewAllButton: {
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.colors.secondaryShade3 ?? theme.colors.baseShade3,
      backgroundColor: theme.colors.background,
    },
    viewAllText: {
      color: theme.colors.base,
    },
    skeletonSection: {
      gap: 16,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    tabList: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
  });

  return { styles, theme };
};
