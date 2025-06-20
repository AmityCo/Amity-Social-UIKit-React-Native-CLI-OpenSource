import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      gap: 8,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.colors.baseShade4,
    },
    info: {
      gap: 16,
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    center: {
      textAlign: 'center',
    },
    base: {
      color: theme.colors.base,
    },
    baseShade1: {
      color: theme.colors.baseShade1,
    },
    flexRow: {
      gap: 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    textContainer: {
      flex: 1,
      flexShrink: 1,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderColor: theme.colors.baseShade4,
    },
  });

  return {
    theme,
    styles,
  };
};
