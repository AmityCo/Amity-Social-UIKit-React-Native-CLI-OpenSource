// Styles for MessageRow — ported from AmityUiKitWeb MessageRow.module.css.
// Geometry: row gap 0.5rem→8, padding 0.25rem 0→vertical 4, max-width 80%, side
// margin 1rem→16; avatar 2rem→32; content gap 0.25rem→4; bubbleRow gap 8;
// timestamp (__side) paddingBottom 0.5rem→8. Colours via design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      paddingVertical: 4,
      maxWidth: '80%',
    },
    rowOwn: {
      alignSelf: 'flex-end',
      justifyContent: 'flex-end',
      marginRight: 16,
    },
    rowOther: {
      alignSelf: 'flex-start',
      justifyContent: 'flex-start',
      marginLeft: 16,
    },
    avatar: {
      width: 32,
      height: 32,
      flexShrink: 0,
    },
    content: {
      flexDirection: 'column',
      gap: 4,
      minWidth: 0,
      flexShrink: 1,
    },
    contentOwn: {
      alignItems: 'flex-end',
    },
    contentOther: {
      alignItems: 'flex-start',
    },
    senderName: {
      maxWidth: '100%',
      color: token(AmityColorToken.TextChatBubbleInboundHeaderUserNameDefault),
    },
    bubbleRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    side: {
      color: token(AmityColorToken.TextTimestampDefault),
      flexShrink: 0,
      paddingBottom: 8,
    },
  });

  return { styles, token };
};
