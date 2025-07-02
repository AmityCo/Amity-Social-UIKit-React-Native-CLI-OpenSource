import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    menuIcon: {
      width: 24,
      height: 24,
      resizeMode: 'cover',
      tintColor: theme.colors.base,
    },
    modal: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      padding: 10,
      minHeight: 700,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: theme.colors.background,
    },
    twoOptions: {
      minHeight: 750,
    },
    menuItem: {
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 10,
    },
    handleBar: {
      alignSelf: 'center',
      width: 36,
      backgroundColor: theme.colors.baseShade3,
      height: 5,
      marginVertical: 10,
      borderRadius: 10,
    },
    base: {
      color: theme.colors.base,
    },
    alert: {
      color: theme.colors.alert,
    },
  });

  return { theme, styles };
};
