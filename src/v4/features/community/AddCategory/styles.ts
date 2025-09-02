import { Platform, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    categoryContainer: {
      paddingBottom: bottom + (Platform.OS === 'ios' ? 100 : 140),
    },
    skeletonContainer: {
      padding: 16,
      gap: 16,
    },
    selectedCategoriesContainer: {
      gap: 8,
      flexWrap: 'wrap',
      paddingVertical: 24,
      flexDirection: 'row',
      borderBottomWidth: 1,
      paddingHorizontal: 16,
      alignItems: 'flex-start',
      backgroundColor: theme.colors.background,
      borderBottomColor: theme.colors.baseShade4,
    },
    categoryOption: {
      gap: 12,
    },
    categoryLabel: {
      flex: 1,
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryImage: {
      width: 40,
      height: 40,
      borderRadius: 100,
      objectFit: 'cover',
    },
    categoryLabelText: {
      flexShrink: 1,
    },
    submitButtonContainer: {
      flex: 1,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 16,
      zIndex: 100,
      borderTopWidth: 1,
      position: 'absolute',
      paddingBottom: bottom + 16,
      borderTopColor: theme.colors.baseShade4,
      backgroundColor: theme.colors.background,
    },
  });

  return { styles, theme };
};
