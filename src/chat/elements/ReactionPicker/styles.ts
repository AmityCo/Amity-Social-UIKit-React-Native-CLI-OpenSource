// Styles for ReactionPicker — ported from AmityUiKitWeb
// v4/chat/elements/ReactionPicker/ReactionPicker.module.css PLUS the pill
// wrapper web keeps in MessageActionsPopover.module.css
// (`.messageActionsPopover__reactionPicker`: filled-default surface, full radius,
// box-shadow-04). The wrapper is folded in here so the component is a drop-in
// for the RN action menu — mounting it closes web's reactionpopover-filled-default
// gap. Orchestrator MUST NOT double-wrap it in another pill.
// rem→px ×16.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';
import { useAmityTheme } from '../../../core/design/theme/AmityThemeProvider';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';

// `.messageActionsPopover__reactionPicker` padding (0.5rem). Exported because the
// drag hit-test tolerates this much overshoot past the first/last icon before it
// treats the touch as having left the bar.
export const PILL_PADDING = 8;

// PDT-5043: headroom reserved ABOVE the pill so the touch-hovered icon and its
// floating name label render inside the picker's own box. Web needs no such
// reservation — its popover is an unclipped absolutely-positioned layer — but in
// RN the action menu's `pickerCard` sets overflow:'hidden', so anything drawn
// above the pill was clipped away. Worst case measured from web's geometry:
// label base top -2.05rem (-32.8) + hover translateY(-9) = 41.8px above the icon
// box, of which the pill's own 8px padding already covers part; 36 clears it
// with margin to spare (the 1.3× icon scale only reaches 12.8px up).
const HEADROOM = 36;

export const useStyles = () => {
  const token = useToken();
  const { mode } = useAmityTheme();

  const styles = StyleSheet.create({
    // Transparent band + pill. Sized to content so the action menu's card still
    // hugs the bar.
    root: {
      alignSelf: 'flex-start',
      paddingTop: HEADROOM,
    },
    // .messageActionsPopover__reactionPicker (the filled pill)
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: PILL_PADDING,
      borderRadius: 9999,
      backgroundColor: token(
        AmityColorToken.SurfaceReactionsReactionPopoverFilledDefault
      ),
      // PDT-3934: match web reaction-bar elevation-08 (3 stacked layers:
      // 0 4px 24px 4px / 0 32px 64px -12px / 0 6px 6px -4px). RN can't stack
      // shadows, so approximate with a single heavier, softer shadow; colour is
      // theme-aware (light rgba(41,43,50), dark rgba(0,0,0)) per the token defs.
      shadowColor: mode === 'dark' ? 'rgb(0, 0, 0)' : 'rgb(41, 43, 50)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 12,
    },
    // .reactionPickerContainer
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    // .reactionButton (2rem × 2rem)
    reactionButton: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
    },
    // .reactionButton__activeBackground
    //
    // PDT-5044: web's chat picker draws this circle behind `reaction.image`,
    // artwork that carries transparent padding, so a same-size circle still
    // reads as a halo. RN renders the ported ReactionGlyph art instead, whose
    // outer <Circle r=16> fills the whole 32px box opaquely — a 32px circle
    // behind it was 100% occluded, which is why an already-given reaction looked
    // unselected when the bar was reopened. Web's own social picker sizes the
    // same element at 2.5rem behind a 2rem icon
    // (social/elements/ReactionPicker.module.css), so adopt that: 40px centred on
    // the 32px glyph leaves a 4px ring. The 4px bleed sits inside the pill's 8px
    // padding and inside the row's 8px gaps, so nothing collides or overflows.
    activeBackground: {
      position: 'absolute',
      top: -4,
      left: -4,
      width: 40,
      height: 40,
      borderRadius: 9999,
      backgroundColor: token(
        AmityColorToken.SurfaceReactionsReactionPopoverReactionStateActive
      ),
    },
    // .reactionButton__text (floating label tooltip). Base offset only — the
    // hover reveal (opacity + translateY(-9)) is animated in the component.
    label: {
      position: 'absolute',
      top: -33,
      alignSelf: 'center',
      maxWidth: 64,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 28,
      backgroundColor: token(
        AmityColorToken.SurfaceReactionsReactionPopoverReactionNameActive
      ),
      zIndex: 2,
    },
    labelText: {
      textTransform: 'capitalize',
      textAlign: 'center',
      color: token(
        AmityColorToken.TextReactionsReactionPopoverReactionNameGeneral
      ),
    },
  });

  return { styles };
};
