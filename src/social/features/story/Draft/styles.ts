import { StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const { width, height } = useWindowDimensions();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.base,
    },
    backBtn: {
      position: 'absolute',
      top: Platform.select({ ios: 56, android: 28 }),
      left: 24,
    },
    aspectRatioBtn: {
      position: 'absolute',
      top: Platform.select({ ios: 56, android: 28 }),
      right: 72,
    },
    aspectRationIcon: {
      width: 32,
      height: 32,
    },
    avatar: {
      width: 35,
      height: 35,
      borderRadius: 50,
    },
    imageContainer: {
      maxHeight: height * 0.9,
      height: '85%',
      width: width,
      borderRadius: 20,
      backgroundColor: theme.colors.baseShade4,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    shareStoryBtn: {
      marginTop: 16,
      marginRight: 8,
      alignSelf: 'flex-end',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 5,
      paddingVertical: 5,
      borderRadius: 50,
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.base,
      borderWidth: 1,
    },
    shareStoryTxt: {
      color: theme.colors.base,
      fontSize: 14,
      marginHorizontal: 8,
    },
    bottomSheet: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: theme.colors.background,
      width: width,
      height: 0.9 * height,
    },
    hyperLinkBtn: {
      position: 'absolute',
      top: Platform.select({ ios: 56, android: 28 }),
      right: 24,
    },
    hyperlinkContainer: {
      backgroundColor: 'rgba(255,255,255,0.8)',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.baseShade4,
      paddingLeft: 12,
      paddingRight: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      gap: 8,
      position: 'absolute',
      bottom: '20%',
    },
    hyperlinkText: {
      fontSize: 15,
      color: theme.colors.base,
    },
    hyperLinkIcon: {
      width: 32,
      height: 32,
      color: theme.colors.primary,
    },
    handleBar: {
      width: 36,
      backgroundColor: theme.colors.baseShade3,
      height: 4,
      marginVertical: 10,
      borderRadius: 10,
      alignSelf: 'center',
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 12,
    },
    flexContainer: {
      flex: 1,
    },
    title: {
      fontSize: 17,
      fontWeight: 'bold',
      color: theme.colors.base,
      textAlign: 'center',
    },
    done: {
      fontSize: 15,
      color: theme.colors.primaryShade2,
      textAlign: 'right',
    },
    cancel: {
      fontSize: 15,
      color: theme.colors.base,
    },
    activeDone: {
      color: theme.colors.primary,
    },
    horizontalSperator: {
      width: '100%',
      backgroundColor: theme.colors.baseShade4,
      height: 1,
      marginVertical: 10,
    },
    contentContainer: {
      paddingHorizontal: 16,
    },

    commentBottomSheet: {
      height: '100%',
    },
    inputContainer: {
      alignSelf: 'stretch',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
      paddingTop: 24,
      paddingBottom: 16,
    },
    rowContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    textCount: {
      fontSize: 13,
      color: theme.colors.baseShade3,
    },
    label: {
      fontSize: 17,
      color: theme.colors.base,
      marginBottom: 16,
      alignSelf: 'flex-start',
      fontWeight: 'bold',
    },
    requiredSign: {
      color: theme.colors.alert,
    },
    input: {
      padding: 0,
      width: '100%',
      fontSize: 15,
      color: theme.colors.base,
    },
    note: {
      color: theme.colors.baseShade3,
      marginTop: 8,
    },
    inValidUrl: {
      color: theme.colors.alert,
      marginTop: 8,
    },
    removeLink: {
      color: theme.colors.alert,
      fontSize: 15,
    },
    removeLinkContainer: {
      marginTop: 32,
    },
    deleteHyperlinkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingTop: 8,
      paddingBottom: 12,
    },
    removeLinkDivider: {
      height: 1,
      backgroundColor: theme.colors.baseShade4,
      marginHorizontal: 16,
    },
    alertBorderColor: {
      borderBottomColor: theme.colors.alert,
    },
    storyGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
    blurredBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
  });

  return styles;
};
