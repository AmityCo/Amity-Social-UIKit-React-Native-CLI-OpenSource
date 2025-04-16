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
    recommendContainer: {
      paddingLeft: 16,
    },
    trendingContainer: {
      paddingHorizontal: 16,
      marginTop: 20,
    },
  });
  return styles;
};
