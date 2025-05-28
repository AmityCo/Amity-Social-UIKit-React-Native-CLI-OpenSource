import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      gap: 8,
      padding: 16,
      paddingBottom: 32,
    },
  });
  return styles;
};
