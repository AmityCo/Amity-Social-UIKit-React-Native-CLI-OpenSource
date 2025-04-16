import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      textAlign: 'center',
    },
    description: {
      textAlign: 'center',
    },
  });
  return styles;
};
