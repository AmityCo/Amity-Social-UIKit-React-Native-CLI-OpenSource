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
      gap: 8,
    },
    detailBottomWrapLeft: {
      flexDirection: 'column',
      gap: 4,
      flex: 1,
    },
  });
  return styles;
};
