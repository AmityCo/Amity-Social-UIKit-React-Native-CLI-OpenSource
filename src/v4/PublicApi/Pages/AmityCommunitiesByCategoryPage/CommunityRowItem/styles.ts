import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    detailWrap: {
      flex: 1,
    },
  });

  return styles;
};
