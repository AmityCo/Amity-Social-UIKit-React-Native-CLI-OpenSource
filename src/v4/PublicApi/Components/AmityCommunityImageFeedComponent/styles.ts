import { Dimensions, StyleSheet } from 'react-native';

export const useStyles = () => {
  const { height: screenHeight } = Dimensions.get('window');

  const styles = StyleSheet.create({
    otherStatesContainer: {
      height: screenHeight * 0.3,
      paddingHorizontal: 24,
    },
  });
  return styles;
};
