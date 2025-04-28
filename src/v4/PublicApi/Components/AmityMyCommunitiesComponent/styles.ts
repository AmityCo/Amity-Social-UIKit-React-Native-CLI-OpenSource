import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    listSkeleton: {
      marginTop: 16,
      paddingHorizontal: 16,
    },
    list: {
      flex: 1,
      marginTop: 16,
    },
    listContent: {
      paddingHorizontal: 16,
      gap: 16,
    },
  });

  return styles;
};
