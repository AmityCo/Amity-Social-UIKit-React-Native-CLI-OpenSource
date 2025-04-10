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
    },
    communityName: {
      fontSize: 15,
      lineHeight: 18,
      color: theme.colors.base,
    },
    memberText: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.baseShade1,
    },
    joinButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 4,
      marginTop: 8,
    },
  });
  return styles;
};
