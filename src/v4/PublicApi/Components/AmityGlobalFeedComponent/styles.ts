import { StyleSheet } from 'react-native';

export const useStyle = () => {
  const styles = StyleSheet.create({
    feedWrap: {
      height: '100%',
      paddingBottom: 50,
    },
  });
  return styles;
};
