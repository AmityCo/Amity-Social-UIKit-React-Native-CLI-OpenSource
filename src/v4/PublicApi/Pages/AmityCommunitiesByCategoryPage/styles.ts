import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 17,
      gap: 8,
    },
    headerIcon: {
      width: 20,
      height: 20,
      tintColor: theme.colors.base,
      resizeMode: 'contain',
    },
    empty: {
      width: 24,
      height: 24,
    },
    list: {
      marginTop: 8,
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      gap: 16,
    },
  });

  return styles;
};
