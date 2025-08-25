import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;

  const styles = StyleSheet.create({
    commentWrap: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      width: '100%',
      alignSelf: 'center',
    },
    replyCommentWrap: {
      backgroundColor: theme.colors.background,
      paddingTop: 4,
      paddingRight: 12,
    },
    headerSection: {
      paddingVertical: 12,
      flexDirection: 'row',
    },
    replyHeaderSection: {
      paddingTop: 8,
      flexDirection: 'row',
    },
    headerText: {
      fontWeight: '600',
      fontSize: 15,
      marginTop: 3,
      color: theme.colors.base,
    },
    headerTextTime: {
      fontSize: 13,
      fontWeight: '400',
      marginVertical: 4,
      color: theme.colors.baseShade1,
    },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 72,
      marginRight: 12,
      backgroundColor: '#D9E5FC',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rightSection: {
      width: '90%',
    },
    commentBubble: {
      padding: 12,
      backgroundColor: theme.colors.baseShade4,
      marginVertical: 8,
      borderRadius: 12,
      borderTopLeftRadius: 0,
      alignSelf: 'flex-start',
    },

    viewMoreReplyBtn: {
      width: 155,
      borderRadius: 4,
      backgroundColor: theme.colors.baseShade4,
      paddingVertical: 5,
      paddingHorizontal: 8,
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewMoreText: {
      fontWeight: '600',
      color: theme.colors.baseShade1,
      paddingHorizontal: 4,
    },
    commentText: {
      fontSize: 15,
      color: theme.colors.base,
    },
    likeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    likedText: {
      color: theme.colors.primary,
      marginHorizontal: 4,
    },
    btnText: {
      color: theme.colors.baseShade2,
    },
    threeDots: {
      padding: 5,
      opacity: 0.5,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      minHeight: 700,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: theme.colors.background,
    },
    modalRow: {
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    handleBar: {
      alignSelf: 'center',
      width: 36,
      backgroundColor: theme.colors.baseShade3,
      height: 5,
      marginVertical: 10,
      borderRadius: 10,
    },

    normalActionText: {
      color: theme.colors.base,
    },
    dangerActionText: {
      color: theme.colors.alert,
    },
    twoOptions: {
      minHeight: 750,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dot: {
      color: theme.colors.baseShade1,
      fontWeight: '900',
      paddingHorizontal: 5,
    },
    mentionText: {
      color: theme.colors.primary,
      fontSize: 15,
    },
    inputText: {
      color: theme.colors.base,
      fontSize: 15,
    },
  });

  return styles;
};
