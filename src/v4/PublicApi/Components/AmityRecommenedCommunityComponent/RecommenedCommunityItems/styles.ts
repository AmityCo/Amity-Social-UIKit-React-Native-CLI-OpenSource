import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      width: 268,
      height: 222,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.baseShade4,
    },
    imagePlaceholder: {
      width: '100%',
      height: 134,
      backgroundColor: theme.colors.secondaryShade3,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    image: {
      width: '100%',
      height: 134,
      overflow: 'hidden',
    },
    detailWrap: {
      padding: 12,
    },
    communityNameWarp: {
      flexDirection: 'row',
      gap: 2,
      alignItems: 'center',
      marginBottom: 4,
    },
    communityName: {
      flex: 1,
      color: theme.colors.base,
    },
    detailBottomWrap: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      gap: 8,
    },
    detailBottomWrapLeft: {
      flex: 1,
    },
  });
  return styles;
};
