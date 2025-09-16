import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    defaultUserAvatar: {
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryShade2,
      position: 'relative',
    },
    firstChar: {
      color: theme.colors.background,
    },
    moderatorBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
  });

  return { styles, theme };
};
