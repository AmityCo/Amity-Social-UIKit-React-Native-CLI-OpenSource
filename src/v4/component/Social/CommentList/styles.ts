import { StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const { width } = useWindowDimensions();
  const styles = StyleSheet.create({
    root: {
      height: '100%',
      paddingBottom: 40,
    },
    suggestionContainer: {
      bottom: 0,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    input: {
      backgroundColor: theme.colors.baseShade4,
      borderRadius: 20,
      fontWeight: '400',
      width: '90%',
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: theme.colors.base,
    },
    inputWrap: {
      gap: 8,
      borderTopWidth: 1,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      justifyContent: 'space-between',
      borderTopColor: theme.colors.baseShade4,
      backgroundColor: theme.colors.background,
    },
    postDisabledBtn: {
      color: '#A0BDF8',
      fontSize: 16,
    },
    postBtnText: {
      color: theme.colors.primary,
      fontSize: 16,
    },
    postBtn: {
      marginHorizontal: 12,
      marginBottom: 4,
    },
    commentItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    comment: {
      fontSize: 14,
    },
    commentListWrap: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.baseShade4,
    },
    textInput: {
      fontSize: 15,
      width: '100%',
      paddingVertical: 0,
      paddingTop: 0,
    },
    transparentText: {
      color: 'transparent',
    },
    inputContainer: {
      flex: 1,
      borderRadius: 20,
      backgroundColor: theme.colors.baseShade4,
      paddingVertical: Platform.OS === 'android' ? 8 : 12,
      paddingHorizontal: Platform.OS === 'android' ? 12 : 14,
    },
    mentionText: {
      color: theme.colors.primary,
      fontSize: 15,
    },
    inputText: {
      color: theme.colors.base,
      fontSize: 15,
      letterSpacing: 0,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject, // Take up the whole screen
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingHorizontal: 12,
    },
    inputTextOverlayWrap: {
      flexDirection: 'row',
      backgroundColor: theme.colors.baseShade4,
    },
    replyLabelWrap: {
      height: 40,
      backgroundColor: theme.colors.baseShade4,
      paddingVertical: 10,
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
    },
    replyLabel: {
      color: theme.colors.baseShade1,
      fontSize: 15,
      paddingLeft: 16,
      paddingRight: 12,
    },
    closeIcon: {
      marginRight: 12,
    },
    userNameLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.baseShade1,
    },
    commentListFooter: {
      width: width,
    },
  });

  return styles;
};
