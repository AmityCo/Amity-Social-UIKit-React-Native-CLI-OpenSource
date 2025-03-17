import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      marginTop: 8,
      paddingHorizontal: 16,
      paddingTop: 4,
      height: 48,
    },
    infoIcon: {},
    headerSection: {
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerRightSection: {},
    adBadge: {
      flexDirection: 'row',
      gap: 2,
      backgroundColor: theme.colors.baseShade1,
      fontSize: 11,
      borderRadius: 20,
      paddingLeft: 4,
      paddingRight: 6,
      opacity: 0.5,
      alignItems: 'center',
    },
    adBadgeContent: {
      color: 'white',
      lineHeight: 18,
    },
    headerText: {
      fontWeight: '600',
      fontSize: 15,
      color: theme.colors.base,
      lineHeight: 20,
    },

    avatar: {
      height: 32,
      width: 32,
      borderRadius: 16,
    },
    badge: {},
  });

  return styles;
};
