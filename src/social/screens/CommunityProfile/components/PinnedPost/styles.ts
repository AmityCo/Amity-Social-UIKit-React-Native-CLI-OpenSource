import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = () => {
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      paddingBottom: bottom + 4,
    },
  });
  return styles;
};
