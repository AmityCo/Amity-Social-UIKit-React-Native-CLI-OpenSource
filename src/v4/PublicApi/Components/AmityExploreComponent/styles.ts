import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;

  const styles = StyleSheet.create({
    container: {},
    categoryChipsContentContainer: {
      gap: 8,
      marginVertical: 16,
    },
    seeMoreCategoryButton: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.baseShade4,
      marginEnd: 16,
    },
    seeMoreCategoryText: {
      color: theme.colors.base,
    },
    categoriesContainer: {
      paddingLeft: 16,
    },
    recommendContainer: {
      paddingLeft: 16,
    },
    trendingContainer: {
      paddingHorizontal: 16,
    },
  });
  return styles;
};
