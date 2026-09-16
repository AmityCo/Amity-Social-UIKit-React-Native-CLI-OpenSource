// Styles for MessageRow — ported from AmityUiKitWeb MessageRow.module.css.
// Geometry: row gap 0.5rem→8, padding 0.25rem 0→vertical 4, max-width 80%, side
// margin 1rem→16; avatar 2rem→32; content gap 0.25rem→4; bubbleRow gap 8;
// timestamp (__side) paddingBottom 0.5rem→8. Colours via design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // No maxWidth here on purpose. Web has `.messageRow { max-width: 80% }`,
    // but this row also holds the avatar and the timestamp, and the design SoT
    // is explicit that the 60% rule targets the bubble's message content
    // (Figma `ChatBubble / Message Content` = 228) and NOT the whole row
    // (`ChatBubble` = 343): "implementations must not let the avatar or
    // timestamp consume the bubble's budget."
    //
    // An 80% cap here does exactly that. At 375pt: cap 300, against a 60%
    // bubble (225) + avatar (32 + 8 gap) + timestamp (~33 + 8 gap) = 306 — so
    // the cap binds and shaves the bubble, by an amount that varies with the
    // clock string. That is precisely the Android defect the SoT documents
    // (a `widthIn(max = 280.dp)` on the Row shared with the timestamp left the
    // bubble at 55.6% of a 411dp screen); it was fixed there by removing the
    // Row cap. The bubble carries its own hard 60% cap, so nothing here can
    // overflow: worst case is ~74% of the window.
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      paddingVertical: 4,
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
    // web .messageRow__errorButton: flex-shrink 0 + align-self center — the
    // failed-message button opts out of the row's flex-end so it sits level with
    // the middle of the bubble.
    failedButton: {
      flexShrink: 0,
      alignSelf: 'center',
    },
    // web messageRow__reactionBadge sits absolute at bottom:-0.875rem, overlapping
    // the bubble's bottom edge. RN approximates with a small negative margin (in-flow);
    // side alignment is inherited from content column (own → end, other → start).
    reactionBadge: {
      marginTop: -6,
    },
    side: {
      color: token(AmityColorToken.TextTimestampDefault),
      flexShrink: 0,
      paddingBottom: 8,
    },
  });

  return { styles, token };
};
