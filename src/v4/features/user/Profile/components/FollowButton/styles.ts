import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    followIcon: {
      width: 18,
      height: 16,
    },
    userProfileFollowButton: {
      marginVertical: 8,
    },
  });

  return styles;
};
