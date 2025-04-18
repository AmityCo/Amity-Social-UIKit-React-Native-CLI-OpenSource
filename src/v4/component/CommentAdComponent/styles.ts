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
      flexDirection: 'row',
      gap: 8,
    },
    avatar: {
      height: 32,
      width: 32,
      borderRadius: 16,
    },
    bubble: {
      backgroundColor: theme.colors.baseShade4,
      padding: 12,
      borderTopLeftRadius: 0,
      borderRadius: 12,
      flex: 1,
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
      marginBottom: 4,
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
      marginBottom: 4,
    },
    callToActionCard: {
      display: 'flex',
      borderRadius: 8,
      overflow: 'hidden',
      borderColor: theme.colors.baseShade4,
      borderWidth: 1,
      backgroundColor: theme.colors.background,
      flexDirection: 'row',
      height: 116,
    },
    callToActionCardImage: {
      width: 116,
      height: '100%',
    },
    callToActionCardRightSection: {
      paddingVertical: 14.5,
      paddingHorizontal: 12,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.baseShade4,
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    },
    callToActionCardDescription: {
      fontSize: 10,
      color: theme.colors.baseShade1,
      lineHeight: 13,
      marginBottom: 2,
    },
    callToActionCardHeadline: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.base,
      lineHeight: 18,
    },
    callToActionButton: {
      marginTop: 8,
      paddingHorizontal: 8,
      paddingVertical: 5,
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    callToActionText: {
      fontSize: 13,
      fontWeight: '600',
      color: 'white',
      lineHeight: 18,
    },
  });

  return styles;
};
