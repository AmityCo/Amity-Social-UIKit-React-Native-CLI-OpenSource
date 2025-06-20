import { StyleSheet } from 'react-native';
import { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 4,
      width: '100%',
    },
    scrollableContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    allVisible: {
      flexWrap: 'nowrap',
      overflow: 'scroll',
    },
    chipContainer: {
      backgroundColor: theme.colors.baseShade4,
      paddingHorizontal: 6,
      borderRadius: 20,
    },
    chipText: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.base,
    },
  });
  return styles;
};
