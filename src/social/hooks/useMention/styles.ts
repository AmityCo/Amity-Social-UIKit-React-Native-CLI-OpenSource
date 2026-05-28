import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;

  const styles = StyleSheet.create({
    mention: {
      color: theme.colors.primary,
    },
    postMentionSuggestionContainer: {
      left: 0,
      right: 0,
      zIndex: 100,
      maxHeight: 56 * 6,
      overflow: 'scroll',
      backgroundColor: 'white',
    },
    commentMentionContainer: {
      left: 0,
      right: 0,
      maxHeight: 56 * 3,
      position: 'absolute',
      overflow: 'scroll',
      backgroundColor: 'white',
    },
    mentionSuggestionContentContainer: {
      paddingHorizontal: 16,
    },
  });

  return {
    theme,
    styles,
  };
};
