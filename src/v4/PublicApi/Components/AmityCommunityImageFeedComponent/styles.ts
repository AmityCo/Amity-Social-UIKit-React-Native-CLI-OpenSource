import { Dimensions, StyleSheet } from 'react-native';

export const useStyles = () => {
  const { height: screenHeight } = Dimensions.get('window');

  const styles = StyleSheet.create({
    otherStatesContainer: {
      height: screenHeight * 0.5,
      paddingHorizontal: 24,
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
