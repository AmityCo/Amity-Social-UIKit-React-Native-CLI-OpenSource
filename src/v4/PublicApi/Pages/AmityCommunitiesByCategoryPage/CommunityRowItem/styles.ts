import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 12,
    },
    detailWrap: {
      paddingVertical: 8,
      flex: 1,
    },
    detailBottomWrap: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      marginTop: 4,
      gap: 8,
    },
  });

  return styles;
};
