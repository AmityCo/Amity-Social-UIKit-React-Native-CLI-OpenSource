import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    categoriesContainers: {
      padding: 16,
    },
    recommendedCommunitiesContainer: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 16,
    },
    trendingCommunitiesContainer: {
      padding: 16,
    },
  });
  return styles;
};
