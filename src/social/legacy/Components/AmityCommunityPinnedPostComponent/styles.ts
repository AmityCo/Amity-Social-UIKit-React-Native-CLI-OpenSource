import { Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = () => {
  const { height: screenHeight } = Dimensions.get('window');
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    listContainer: {
      paddingHorizontal: 24,
      height: screenHeight * 0.3,
    },
    container: {
      paddingBottom: bottom + 4,
    },
  });
  return styles;
};
