import { Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = () => {
  const { height: screenHeight } = Dimensions.get('window');
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    listContainer: {
      height: screenHeight * 0.3,
      paddingHorizontal: 24,
    },
    container: {
      paddingBottom: bottom + 4,
    },
    communityNameWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 2,
    },
    categoryWrap: {
      paddingLeft: 16,
      paddingVertical: 8,
    },
    descriptionWrap: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    infoWrap: {
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    joinButtonWrap: {
      margin: 16,
    },
  });
  return styles;
};
