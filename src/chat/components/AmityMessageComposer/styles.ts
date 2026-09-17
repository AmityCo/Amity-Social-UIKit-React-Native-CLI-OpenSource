// Styles for AmityMessageComposer — ported from AmityUiKitWeb
// MessageComposer.module.css. Geometry: inputRow gap 0.75rem→12, padding
// 0.5rem 1rem→8/16, min-height 3.5rem→56; icon buttons 2rem→32 round. The boxed
// input surface now lives in the shared TextEditor. Edit panel + mention overlay
// are RN additions. All colours resolve through design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
      borderTopWidth: 1,
      borderTopColor: token(AmityColorToken.LineDividerPostDefault),
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
      minHeight: 56,
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledSecondaryEnabled
      ),
    },
    sendButton: {
      width: 32,
      height: 32,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledSecondaryDisabled
      ),
    },
    sendButtonEnabled: {
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledPrimaryEnabled
      ),
    },
    // --- Edit panel ----------------------------------------------------------
    editPanel: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: token(AmityColorToken.LineDividerPostDefault),
    },
    editPanelInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    editPanelLabel: {
      color: token(AmityColorToken.TextBaseSubdue),
    },
    editPanelClose: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // --- Mention suggestion overlay -----------------------------------------
    // Ported from web MentionMenu (data-display-mode='bottom') + UserMentionItem.
    // Container: surface-popover-background, radius 0.75rem→12, max-height 7rem→112,
    // elevation shadow (web box-shadow via elevation-08 tokens; RN has no elevation
    // tokens, approximated with an rgb() shadow). Web uses a shadow, NOT a border.
    // The box the close button anchors to. Figma gives it horizontal padding
    // only (0 8), so the button can overhang the panel's top edge.
    mentionContainer: {
      position: 'relative',
      paddingHorizontal: 8,
      marginBottom: 8,
    },
    mentionOverlay: {
      paddingVertical: 8,
      borderRadius: 12,
      // No `overflow: 'hidden'` here. On iOS that sets clipsToBounds, which
      // clips the view's own shadow away. The 8px vertical padding already keeps
      // the rows clear of the rounded corners, so there is nothing to clip.
      backgroundColor: token(AmityColorToken.SurfacePopoverBackgroundDefault),
      shadowColor: 'rgb(40, 41, 61)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
      elevation: 8,
    },
    // Figma: the popover is 112 tall including its 8/8 padding, so the scrolling
    // slot inside it is 96.
    mentionList: {
      maxHeight: 96,
    },
    // web UserMentionItem__item: grid [2rem avatar | auto], gap 0.75rem→12,
    // padding 0.75rem→12, bg surface-popover-lists-default.
    mentionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      backgroundColor: token(AmityColorToken.SurfacePopoverListsDefault),
    },
    mentionItemPressed: {
      backgroundColor: token(AmityColorToken.SurfacePopoverListsHover),
    },
    mentionAvatar: {
      width: 32,
      height: 32,
    },
    mentionDisplayName: {
      flexShrink: 1,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    // web UserMentionItem__allIconCircle: 2rem circle, surface-featuredicon-solid.
    mentionAllIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token(AmityColorToken.SurfaceFeaturedIconSolid),
    },
    mentionAllGlyph: {
      fontSize: 15,
      fontWeight: '500',
      lineHeight: 22,
      color: token(AmityColorToken.IconFeaturedIconSolid),
    },
    // web __allRightPane: flex row, space-between; description → trailing-text token.
    mentionAllRightPane: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      minWidth: 0,
    },
    mentionAllDescription: {
      flexShrink: 0,
      color: token(AmityColorToken.TextListTrailingTextGeneral),
    },
    // web mentionContainer__closeButton (bottom mode): top 0 / right 0.25rem→4,
    // 1.5rem→24 circle, padding 0.25rem→4, surface-iconbutton-filled-secondary.
    // Figma: 24 round chip at dx 339 / dy -8 against a 359-wide panel — 8 above
    // the panel's top edge and 4 past its right edge, so it reads as sitting on
    // the rim rather than inside the list.
    mentionCloseButton: {
      position: 'absolute',
      top: -8,
      right: 4,
      width: 24,
      height: 24,
      borderRadius: 9999,
      padding: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledSecondaryEnabled
      ),
    },
  });

  const placeholderColor = token(
    AmityColorToken.TextInputTextInputPlaceholderEnabled
  );

  return { styles, token, placeholderColor };
};
