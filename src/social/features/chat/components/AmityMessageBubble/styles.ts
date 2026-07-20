// Styles for AmityMessageBubble — ported from AmityUiKitWeb MessageBubble.module.css
// (.textBubble / .textBubble__text). Geometry: border-radius 1.25rem→20, text
// padding 0.625rem 1rem 0 + margin-bottom 0.625rem → paddingTop 10 / horizontal 16 /
// bottom 10, font-size 0.875rem→14, line-height 1.3→18. Colours resolve through the
// design tokens (surface/text chatbubble, inbound vs outbound). No hardcoded hex.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    bubble: {
      maxWidth: '78%',
      borderRadius: 20,
      overflow: 'hidden',
    },
    bubbleOwn: {
      backgroundColor: token(
        AmityColorToken.SurfaceChatBubbleMessageOutboundDefault
      ),
    },
    bubbleOwnPressed: {
      backgroundColor: token(
        AmityColorToken.SurfaceChatBubbleMessageOutboundPressed
      ),
    },
    bubbleOther: {
      backgroundColor: token(
        AmityColorToken.SurfaceChatBubbleMessageInboundDefault
      ),
    },
    bubbleOtherPressed: {
      backgroundColor: token(
        AmityColorToken.SurfaceChatBubbleMessageInboundPressed
      ),
    },
    text: {
      paddingTop: 10,
      paddingHorizontal: 16,
      paddingBottom: 10,
      fontSize: 14,
      lineHeight: 18,
    },
    textOwn: {
      color: token(AmityColorToken.TextChatBubbleOutboundMessagesDefault),
    },
    textOther: {
      color: token(AmityColorToken.TextChatBubbleInboundMessagesDefault),
    },
    deletedText: {
      fontStyle: 'italic',
    },
  });

  return { styles, token };
};
