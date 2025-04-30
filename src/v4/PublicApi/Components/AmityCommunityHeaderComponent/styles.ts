import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
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
  });
  return styles;
};
