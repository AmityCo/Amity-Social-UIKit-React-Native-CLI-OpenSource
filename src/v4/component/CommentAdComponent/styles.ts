import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      marginTop: 8,
      paddingHorizontal: 16,
      paddingTop: 4,
      width: '100%',
    },
    avatar: {
      height: 32,
      width: 32,
      borderRadius: 16,
    },
    bubble: {
      backgroundColor: theme.colors.baseShade4,
      padding: 12,
      borderRadius: 12,
    },
    infoIcon: {
      position: 'absolute',
      right: 4,
      top: 4,
    },
    header: {
      marginBottom: 4,
    },
    headerText: {
      fontWeight: '600',
      fontSize: 14,
      color: theme.colors.base,
      lineHeight: 20,
    },
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
      alignSelf: 'flex-start',
    },
    adBadgeIcon: {
      width: 16,
      height: 16,
      color: 'white',
    },
    adBadgeContent: {
      color: 'white',
      lineHeight: 18,
    },
    textContent: {
      color: theme.colors.base,
      fontSize: 14,
      lineHeight: 20,
      marginVertical: 8,
    },
    callToActionCard: {
      display: 'flex',
      borderRadius: 8,
      overflow: 'hidden',
      borderColor: theme.colors.baseShade4,
      borderWidth: 1,
    },
    callToActionCardImage: {
      width: '100%',
      height: 150,
    },
    callToActionCardRightSection: {
      padding: 12,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.baseShade4,
    },
    callToActionCardDescription: {
      fontSize: 11,
      color: theme.colors.baseShade1,
      lineHeight: 18,
    },
    callToActionCardHeadline: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.base,
      lineHeight: 18,
    },
    callToActionButton: {
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    callToActionText: {
      fontSize: 13,
      fontWeight: '600',
      color: 'white',
      lineHeight: 18,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
  });

  return styles;
};
