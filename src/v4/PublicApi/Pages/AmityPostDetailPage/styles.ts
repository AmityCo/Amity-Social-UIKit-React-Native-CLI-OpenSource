import { Platform, StyleSheet, useWindowDimensions } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = (theme: MyMD3Theme) => {
  const { width } = useWindowDimensions();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    skeletonContainer: {
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    header: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    headerIcon: {
      width: 18,
      height: 18,
      tintColor: theme.colors.base,
      resizeMode: 'contain',
    },
    headerTitle: {
      fontSize: 17,
      color: theme.colors.base,
      fontWeight: '600',
    },
    scrollContainer: {
      flex: 1,
      paddingBottom: 50,
    },
    input: {
      color: theme.colors.base,
    },
    InputWrap: {
      backgroundColor: theme.colors.background,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingBottom: 25,
      paddingTop: 10,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.baseShade4,
    },
    myAvatar: {
      width: 32,
      height: 32,
      borderRadius: 32,
      alignSelf: 'center',
      marginRight: 8,
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

    inputContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingVertical: Platform.OS === 'android' ? 2 : 10,
      paddingHorizontal: Platform.OS === 'android' ? 6 : 12,
      backgroundColor: theme.colors.baseShade4,
      borderRadius: 20,
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
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
  });

  return styles;
};
