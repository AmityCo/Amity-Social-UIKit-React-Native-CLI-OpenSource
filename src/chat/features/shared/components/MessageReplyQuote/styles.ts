// Styles for MessageReplyQuote — ported from MessageReplyQuote.module.css.
// Geometry: gap 0.25rem→4; header gap 0.25rem→4; header icon 1rem→16; header
// max-width 18.75rem→300; quote radius 1.25rem→20; text bubble padding
// 0.625/1rem→10/16, text 15/20 (raw CSS); media radius 20; broken icon
// 1.5rem→24; play chip 2.5rem→40; play icon 1.5rem→24; deleted bubble padding
// 4/8, border 1; placeholder height 60. Header/overlay colours differ per side
// (own = Outbound tokens, other = Inbound).
//
// The quote's width (web's 14.25rem→228, and the placeholder's 228) is NOT a
// fixed value — 228 is the 60%-of-viewport rule on Figma's 375px artboard. It
// is derived from that rule here so the quote tracks the reply bubble at every
// screen size (PDT-4926). See src/chat/constants/bubble.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { getBubbleMaxWidth } from '../../../../constants';

export const useStyles = (isUser: boolean) => {
  const token = useToken();

  const headerColor = token(
    isUser
      ? AmityColorToken.TextChatBubbleOutboundHeaderRepliedToDefault
      : AmityColorToken.TextChatBubbleInboundHeaderRepliedToDefault
  );

  const styles = StyleSheet.create({
    container: {
      gap: 4,
      marginBottom: 4,
      alignItems: isUser ? 'flex-end' : 'flex-start',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    headerText: {
      color: headerColor,
      maxWidth: 300,
    },
    quote: {
      position: 'relative',
      borderRadius: 20,
      overflow: 'hidden',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 20,
      backgroundColor: token(
        AmityColorToken.SurfaceChatBubbleReplyOverlayDefault
      ),
    },
    // PDT-4926: this was a flat 228, which is the 60%-of-viewport rule's value
    // on Figma's 375px artboard — not the contract (see
    // src/chat/constants/bubble). Held fixed, the quote fell progressively
    // narrower than the reply bubble as the screen got wider: on an iPhone XR
    // the reply was 298 and the quote 228, a 70px gap where web's is ~20.
    // Deriving both from the same rule keeps them equal at every screen size,
    // which is what the ticket asks for.
    textBubble: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      maxWidth: getBubbleMaxWidth(),
      backgroundColor: token(
        AmityColorToken.SurfaceChatBubbleReplyMessageDefault
      ),
    },
    text: {
      fontSize: 15,
      lineHeight: 20,
      color: token(AmityColorToken.TextChatBubbleInboundMessagesDefault),
    },
    // In-quote URL spans (web .replyQuote__link): inbound-link token + underline on
    // both sides (the web class has no data-user variant). Colour only — the whole
    // quote is the tap target (onOpenSeeMore), so links are not separately tappable.
    link: {
      color: token(AmityColorToken.TextChatBubbleInboundLinkDefault),
      textDecorationLine: 'underline',
    },
    media: {
      borderRadius: 20,
    },
    mediaBox: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    },
    mediaBoxLoading: {
      backgroundColor: token(AmityColorToken.SurfaceMediaImageLoading),
    },
    mediaBoxBroken: {
      backgroundColor: token(AmityColorToken.SurfaceMediaImageBroken),
    },
    playChip: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -20,
      marginLeft: -20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9999,
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonTransparentPrimaryEnabled
      ),
    },
    // Loading placeholder: same derived width as the quote itself, so the quote
    // does not visibly jump width when the parent resolves.
    placeholder: {
      alignItems: 'center',
      justifyContent: 'center',
      width: getBubbleMaxWidth(),
      height: 60,
      borderRadius: 20,
      backgroundColor: token(
        AmityColorToken.SurfaceChatBubbleReplyMessageDefault
      ),
    },
    deletedBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: token(AmityColorToken.BorderChatBubbleInboundDeleted),
      borderRadius: 20,
    },
    deletedText: {
      color: token(AmityColorToken.TextChatBubbleInboundMessagesDeleted),
    },
  });

  const headerIconColor = isUser
    ? AmityColorToken.IconChatBubbleOutboundHeaderRepliedToDefault
    : AmityColorToken.IconChatBubbleInboundHeaderRepliedToDefault;

  return { styles, token, headerIconColor };
};
