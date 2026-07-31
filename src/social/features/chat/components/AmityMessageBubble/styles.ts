// Styles for AmityMessageBubble — ported from AmityUiKitWeb MessageBubble.module.css
// (.textBubble / .textBubble__text). Geometry: border-radius 1.25rem→20, text
// padding 0.625rem 1rem 0 + margin-bottom 0.625rem → paddingTop 10 / horizontal 16 /
// bottom 10, font-size 0.875rem→14, line-height 1.3→18. Colours resolve through the
// design tokens (surface/text chatbubble, inbound vs outbound). No hardcoded hex.

import { Dimensions, StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

// Web caps the text bubble at 60vw. In RN a percentage maxWidth resolves against the
// bubble's parent, and inside the action-menu Popover wrapper that parent has an
// indefinite width — Yoga then collapses the Text to its minimum intrinsic width
// (word/char-per-line). Use a concrete pixel cap off the screen width instead.
const BUBBLE_MAX_WIDTH = Math.round(Dimensions.get('window').width * 0.72);

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    bubble: {
      maxWidth: BUBBLE_MAX_WIDTH,
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
    // Two-line skeleton shown while a long message's line count is measured.
    // Carries the text bubble's padding, and a fixed width of 240 (bubble max)
    // minus its 16 side padding — the measuring probe fills this container, so a
    // width that collapsed to the bars' intrinsic size would make it count lines
    // for the wrong width.
    // The off-screen line-count probe. Absolutely filled so it inherits the
    // container's width (the measurement depends on width, not height), and fully
    // transparent — opacity does not affect layout, so onTextLayout still fires.
    textProbe: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0,
    },
    textSkeleton: {
      paddingTop: 10,
      paddingHorizontal: 16,
      paddingBottom: 10,
      width: 240 - 32,
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
    seeMoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    seeMoreLabel: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '700',
    },
    seeMoreOwn: {
      color: token(AmityColorToken.TextChatBubbleOutboundSeeMoreDefault),
    },
    seeMoreOther: {
      color: token(AmityColorToken.TextChatBubbleInboundSeeMoreDefault),
    },
    // Mention span inside the text (web textBubble__mention, weight 500).
    // Repeat the surrounding text's fontSize/lineHeight (14/18): the 500-weight
    // mention <Text> otherwise renders taller than the 18px line box sized from
    // the 14px body text and its bottom gets clipped (Android).
    mentionOwn: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '500',
      color: token(AmityColorToken.TextChatBubbleOutboundMentionedDefault),
    },
    mentionOther: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '500',
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
    // Web used height 15rem→240 with variable width (inline-block, capped at 20rem/320).
    // In an RN flex row an Image has no intrinsic width to size against, so we pin a
    // fixed 240×240 frame (media fills it, cover-cropped) — reported as a fidelity delta
    // vs web's variable width.
    imageBubble: {
      position: 'relative',
      width: 240,
      height: 240,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: token(AmityColorToken.SurfaceMediaImageLoading),
    },
    videoBubble: {
      position: 'relative',
      width: 240,
      height: 240,
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
