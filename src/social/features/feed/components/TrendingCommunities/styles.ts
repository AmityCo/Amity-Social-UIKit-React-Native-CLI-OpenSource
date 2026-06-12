import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      gap: 8,
    },
  });
  return styles;
};
