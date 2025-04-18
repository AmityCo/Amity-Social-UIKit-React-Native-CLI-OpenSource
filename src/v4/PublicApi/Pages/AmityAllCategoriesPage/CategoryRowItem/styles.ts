import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      gap: 10,
    },
  });

  return styles;
};
