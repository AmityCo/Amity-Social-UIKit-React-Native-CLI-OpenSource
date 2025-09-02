import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'flex-start',
      gap: 8,
      paddingLeft: 4,
      paddingVertical: 4,
      paddingRight: 8,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.baseShade4,
    },
    categoryAvatar: {
      width: 28,
      height: 28,
      borderRadius: 100,
      objectFit: 'cover',
    },
    categoryName: {
      color: theme.colors.base,
      flexShrink: 1,
    },
  });
  return {
    styles,
    theme,
  };
};
