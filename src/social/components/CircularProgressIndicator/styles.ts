import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    backgroundCircle: {
      position: 'absolute',
    },
  });

  return styles;
};
