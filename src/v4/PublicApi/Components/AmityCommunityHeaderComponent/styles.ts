import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    communityNameWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 2,
    },
  });
  return styles;
};
