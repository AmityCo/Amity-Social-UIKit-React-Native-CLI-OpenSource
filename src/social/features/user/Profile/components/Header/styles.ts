import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';

type StyleParams = {
  badgePaddingRight: number;
  badgeTop: number;
  badgeLeft: number;
};

export const useStyles = (
  params: StyleParams = {
    badgePaddingRight: 0,
    badgeTop: 0,
    badgeLeft: 0,
  }
) => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    userInfo: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    image: {
      width: 56,
      height: 56,
      borderRadius: 100,
    },
    displayNameContainer: {
      flex: 1,
      paddingRight: params.badgePaddingRight,
    },
    badge: {
      position: 'absolute',
      top: params.badgeTop,
      left: params.badgeLeft,
    },
    descriptionContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    description: {
      color: theme.colors.base,
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 20,
    },
    seeMore: {
      color: theme.colors.primary,
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 20,
    },
    followInfoContainer: {
      flexDirection: 'row',
      gap: 16,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    followInfoDivider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: theme.colors.baseShade4,
    },
    followInfoLabel: {
      color: theme.colors.baseShade2,
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
  });

  return { styles, theme };
};
