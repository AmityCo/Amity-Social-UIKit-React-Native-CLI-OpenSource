import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    disabled: {
      opacity: 0.2,
    },
  });

  return styles;
};
