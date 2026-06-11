import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    cardLg: {
      gap: 16,
    },
    cardMd: {
      width: 248,
      borderRadius: 8,
      borderWidth: 1,
      overflow: 'hidden',
      borderColor: theme.colors.baseShade4,
      backgroundColor: theme.colors.background,
    },
    list: {
      gap: 16,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
    },
    figureCardLg: {
      width: '100%',
      aspectRatio: 16 / 9,
      overflow: 'hidden',
    },
    figureCardMd: {
      width: '100%',
      height: 142,
      overflow: 'hidden',
    },
    figureList: {
      width: '42%',
      aspectRatio: 16 / 9,
      flexShrink: 0,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
    },
    imageCardMd: {
      width: '100%',
      height: '100%',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    eventTypeBadge: {
      top: 8,
      left: 8,
      position: 'absolute',
    },
    hostBadge: {
      top: 8,
      right: 8,
      position: 'absolute',
    },
    info: {
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    infoCardMd: {
      padding: 16,
    },
    duration: {
      color: theme.colors.base,
    },
    title: {
      color: theme.colors.base,
    },
    creatorRow: {
      gap: 2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    creatorName: {
      flexShrink: 1,
      color: theme.colors.baseShade1,
    },
  });

  return { styles, theme };
};
