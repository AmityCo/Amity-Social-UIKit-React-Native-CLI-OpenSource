import { StyleSheet } from 'react-native';
// import { useTheme } from 'react-native-paper';
// import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  // const theme = useTheme() as MyMD3Theme;

  const styles = StyleSheet.create({
    container: {},
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
