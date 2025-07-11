import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

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
      maxHeight: 168,
      overflow: 'scroll',
      position: 'absolute',
      backgroundColor: 'white',
    },
    commentMentionContainer: {
      left: 0,
      right: 0,
      bottom: 0,
      maxHeight: 300,
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
