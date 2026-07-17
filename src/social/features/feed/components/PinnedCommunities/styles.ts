import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    headerText: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '600',
      color: theme.colors.base,
      marginBottom: 16,
    },
    listContainer: {
      gap: 16,
      paddingRight: 16,
    },
    // Single (full-width) card: the section container only pads the left (the
    // carousel bleeds off the right edge), so add the right padding here so the
    // lone card doesn't touch the screen edge.
    singleCardWrap: {
      paddingRight: 16,
    },
  });
  return styles;
};
