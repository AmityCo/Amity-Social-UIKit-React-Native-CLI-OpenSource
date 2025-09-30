import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
    },
    feedWrap: {
      flex: 1,
    },
  });
  return styles;
};
