import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      overflow: 'scroll',
    },
    categoriesContainer: {
      paddingLeft: 16,
    },
    communitiesSection: {
      flex: 1,
    },
    pinnedContainer: {
      // Left padding matches recommendContainer (16). The single full-width card
      // adds its own right padding (singleCardWrap) so it's symmetric; the
      // multi-card carousel intentionally bleeds off the right edge like
      // Recommended. The category chips above already add 16px of bottom margin,
      // so keep marginTop small to avoid a lopsided top gap; marginBottom (20)
      // matches Trending/the other sections.
      paddingLeft: 16,
      marginTop: 4,
      marginBottom: 20,
    },
    recommendContainer: {
      paddingLeft: 16,
    },
    trendingContainer: {
      paddingHorizontal: 16,
      marginTop: 20,
      marginBottom: 20,
    },
    sectionErrorContainer: {
      minHeight: 400,
    },
    emptyContainer: {
      minHeight: 400,
    },
  });
  return styles;
};
