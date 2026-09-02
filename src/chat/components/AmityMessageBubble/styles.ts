// Styles for AmityMessageBubble — ported from AmityUiKitWeb MessageBubble.module.css
// (.textBubble / .textBubble__text). Geometry: border-radius 1.25rem→20, text
// padding 0.625rem 1rem 0 + margin-bottom 0.625rem → paddingTop 10 / horizontal 16 /
// bottom 10. Body type is SF Pro Regular 15/20 per the design SoT
// (AmityMessageBubble/v2.md "Peer/Own message text · SF Pro Regular · 15/20"),
// which the reply quote already matched. Colours resolve through the design
// tokens (surface/text chatbubble, inbound vs outbound). No hardcoded hex.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';
import {
  MEDIA_BUBBLE_HEIGHT,
  MEDIA_BUBBLE_MAX_WIDTH_IMAGE,
  MEDIA_BUBBLE_MAX_WIDTH_VIDEO,
  getBubbleMaxWidth,
} from '../../constants';

// Body text metrics, shared with the mention spans and the measuring probe so
// every one of them wraps and clamps identically. See src/chat/constants/bubble.
const TEXT_FONT_SIZE = 15;
const TEXT_LINE_HEIGHT = 20;
const TEXT_PADDING_H = 16;

export const useStyles = () => {
  const token = useToken();

  // Resolved per render, not cached at module scope, so rotation re-applies the
  // 60%-of-viewport rule instead of keeping the launch-time width.
  const bubbleMaxWidth = getBubbleMaxWidth();

  const styles = StyleSheet.create({
    bubble: {
      maxWidth: bubbleMaxWidth,
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
    // PDT-4870: the text read as bottom-aligned inside a symmetric padding box.
    // Two causes, both fixed here. (1) The type was 14/18 where the SoT spec
    // says 15/20. (2) RN does not implement CSS half-leading — iOS grows the
    // line box upward from the baseline (lineHeight sets min/maxLineHeight) and
    // Android's CustomLineHeightSpan trims only the line's top — so ALL the
    // extra leading lands above the glyphs and the ink sits low in the box.
    // includeFontPadding: false drops Android's extra top/bottom font padding,
    // which stacks on the same bias.
    text: {
      paddingTop: 10,
      paddingHorizontal: TEXT_PADDING_H,
      paddingBottom: 10,
      fontSize: TEXT_FONT_SIZE,
      lineHeight: TEXT_LINE_HEIGHT,
      includeFontPadding: false,
    },
    // The off-screen line-count probe. It must be constrained on WIDTH ONLY:
    // the line count depends on the wrap width, and giving it a definite height
    // makes iOS lay the text into that bounded box, so onTextLayout reports
    // just the lines that fit and never exceeds maxLines — no "See more" ever
    // appears (PDT-4911). StyleSheet.absoluteFillObject was doing exactly that,
    // because it pins bottom: 0 as well as the sides. Anchor top/left/right and
    // leave the height free. The parent Pressable is overflow: 'hidden', so the
    // taller probe cannot paint outside the bubble.
    textProbe: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      opacity: 0,
    },
    // Two-line skeleton shown while a long message's line count is measured.
    // Carries the text bubble's padding. Its width is derived from the same
    // 60%-of-viewport rule as the bubble, minus the side padding: the probe
    // fills this container, so a width that disagreed with the real bubble's
    // would count lines for the wrong wrap width on every platform.
    textSkeleton: {
      paddingTop: 10,
      paddingHorizontal: TEXT_PADDING_H,
      paddingBottom: 10,
      width: bubbleMaxWidth - TEXT_PADDING_H * 2,
      gap: 8,
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
    // "See more" affordance for truncated long messages, faithful to web:
    // a 1px divider (textBubble__divider) then a space-between row (textBubble__seeMore)
    // of label + chevron-right icon (textBubble__seeMoreIcon 0.75rem→12).
    divider: {
      height: 1,
    },
    dividerOwn: {
      backgroundColor: token(
        AmityColorToken.LineChatBubbleOutboundDividerDefault
      ),
    },
    dividerOther: {
      backgroundColor: token(
        AmityColorToken.LineChatBubbleInboundDividerDefault
      ),
    },
    // SoT: the row is padded 8 / 16 / 8 / 16 with the label leading and a 20px
    // chevron trailing (space-between), and the divider above spans the full
    // bubble width edge-to-edge.
    seeMoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: TEXT_PADDING_H,
    },
    // Web sets this row's label to Typography.Caption — 12/16/400, not the
    // 14/18/700 the port used.
    seeMoreLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
    },
    seeMoreOwn: {
      color: token(AmityColorToken.TextChatBubbleOutboundSeeMoreDefault),
    },
    seeMoreOther: {
      color: token(AmityColorToken.TextChatBubbleInboundSeeMoreDefault),
    },
    // Mention span inside the text (web textBubble__mention, weight 500).
    // Repeat the surrounding text's metrics exactly: the 500-weight mention
    // <Text> otherwise renders taller than the body line box and its bottom
    // gets clipped (Android). These MUST track TEXT_FONT_SIZE/TEXT_LINE_HEIGHT
    // — a mismatch reintroduces PDT-4870's vertical offset on any line that
    // mixes plain text with a mention.
    mentionOwn: {
      fontSize: TEXT_FONT_SIZE,
      lineHeight: TEXT_LINE_HEIGHT,
      fontWeight: '500',
      includeFontPadding: false,
      color: token(AmityColorToken.TextChatBubbleOutboundMentionedDefault),
    },
    mentionOther: {
      fontSize: TEXT_FONT_SIZE,
      lineHeight: TEXT_LINE_HEIGHT,
      fontWeight: '500',
      includeFontPadding: false,
      color: token(AmityColorToken.TextChatBubbleInboundMentionedDefault),
    },
    // "Edited" caption (web textBubble__editedCaption: padding 0 16 10).
    editedCaption: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      fontSize: 10,
      lineHeight: 13,
    },
    editedOwn: {
      color: token(AmityColorToken.TextChatBubbleOutboundEditedLabelDefault),
      textAlign: 'right',
    },
    editedOther: {
      color: token(AmityColorToken.TextChatBubbleInboundEditedLabelDefault),
      textAlign: 'left',
    },
    // Link-preview wrapper padding (web textBubble__preview: 0 10 10).
    preview: {
      paddingHorizontal: 10,
      paddingBottom: 10,
    },
    // In-text URL spans. Web `.textBubble__text a` is underlined and inherits
    // currentcolor (= the message text colour) for outbound; the `data-user='other'`
    // rule overrides inbound links to the inbound-link token. RN nested <Text>
    // inherits colour, so outbound links only need the underline (link) while
    // inbound links add linkOther to recolour.
    link: {
      textDecorationLine: 'underline',
    },
    linkOther: {
      color: token(AmityColorToken.TextChatBubbleInboundLinkDefault),
    },
    // Failed-to-send caption under a moderation-rejected media bubble (web
    // mediaBubble__failedWrapper + mediaBubble__failedCaption: flex column,
    // align flex-end, gap 4; caption helper-text token, 10/13).
    failedWrapper: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 4,
    },
    failedCaption: {
      color: token(AmityColorToken.TextChatBubbleOutboundHelperTextDefault),
      fontSize: 10,
      lineHeight: 13,
    },

    // --- Media (image / video) ---
    // PDT-4916: these were pinned to a fixed 240×240, so landscape AND portrait
    // media were both centre-cropped square. Web locks the HEIGHT at 240 and
    // lets the width shrink to the media's own ratio, capped at 320 (image) /
    // 240 (video) — see getMediaBubbleSize in src/chat/constants/bubble.
    //
    // These styles now carry only the height and the cap; the concrete width
    // arrives as an inline style once the media reports its intrinsic size
    // (<Image onLoad> → nativeEvent.source, <Video onLoad> → naturalSize). The
    // square below is just the pre-measurement box, matching the placeholders.
    imageBubble: {
      position: 'relative',
      width: MEDIA_BUBBLE_HEIGHT,
      height: MEDIA_BUBBLE_HEIGHT,
      maxWidth: MEDIA_BUBBLE_MAX_WIDTH_IMAGE,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: token(AmityColorToken.SurfaceMediaImageLoading),
    },
    videoBubble: {
      position: 'relative',
      width: MEDIA_BUBBLE_HEIGHT,
      height: MEDIA_BUBBLE_HEIGHT,
      maxWidth: MEDIA_BUBBLE_MAX_WIDTH_VIDEO,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: token(AmityColorToken.SurfaceMediaImageLoading),
    },
    mediaImage: {
      width: '100%',
      height: '100%',
    },
    mediaPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 240,
      height: 240,
      borderRadius: 20,
      backgroundColor: token(AmityColorToken.SurfaceMediaImageLoading),
    },
    mediaBroken: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 240,
      height: 240,
      borderRadius: 20,
      backgroundColor: token(AmityColorToken.SurfaceMediaImageBroken),
    },
    // Spinner overlay shown while a remote image downloads (BUG #5). Sits on the
    // media-loading surface (same token web uses for the image loading state).
    mediaLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token(AmityColorToken.SurfaceMediaImageLoading),
    },
    // Web `.mediaBubble__preload` — the off-screen element that warms the remote
    // media before the local preview is dropped. Never meant to be seen: 1×1 and
    // fully transparent, but still mounted so the native view actually loads.
    mediaPreload: {
      position: 'absolute',
      width: 1,
      height: 1,
      opacity: 0,
    },
    mediaPressedScrim: {
      ...StyleSheet.absoluteFillObject,
      // Web used --asc-color-message-overlay (no RN token); substituted with the
      // closest media-context dark scrim (reported as a gap).
      backgroundColor: token(
        AmityColorToken.SurfaceBadgeSemanticBadgePostStatusTotalMedia
      ),
    },
    videoPlayChip: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -20,
      marginLeft: -20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
      borderRadius: 9999,
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonTransparentPrimaryEnabled
      ),
    },
  });

  return { styles, token };
};
