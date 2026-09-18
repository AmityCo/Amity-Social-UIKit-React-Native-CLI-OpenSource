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

// A 36px transparent band above the pill originally kept the floating label
// from being clipped by the action menu's `pickerCard`
// (overflow:'hidden'). That clip is gone — `pickerCard` no longer draws a
// surface at all — so the band is no longer needed, and it was the reason the
// picker floated ~44px from the bubble whenever the popover opened below a
// message (8px anchor gap + 36px of empty band). The label now overhangs the
// pill instead.
//
// Web puts the label `top: -2.05rem` from its own 2rem button, and lifts it a
// further 9px on hover. Measured from the picker root: down past the pill's
// padding to the icon's top edge, then back up by that offset.
const LABEL_TOP_FROM_ICON = -33;
const LABEL_TOP = PILL_PADDING + LABEL_TOP_FROM_ICON;

export const useStyles = () => {
  const token = useToken();
  const { mode } = useAmityTheme();

  const styles = StyleSheet.create({
    // Transparent band + pill. Sized to content so the action menu's card still
    // hugs the bar.
    root: {
      alignSelf: 'flex-start',
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
      // Match web reaction-bar elevation-08 (3 stacked layers:
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
    // Web's chat picker draws this circle behind `reaction.image`,
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
    // .reactionButton__text (floating label tooltip).
    //
    // ONE label for the whole picker, not one per icon. Web can hang a label off
    // each 2rem button because its tooltip escapes the button box; in RN an
    // absolutely-positioned child with no left/right is clamped to its
    // containing block, so a per-button label could never be wider than the 32px
    // `reactionButton` — which is why every name came back ellipsised no matter
    // what `maxWidth` said. This anchor spans the pill and centres its content,
    // so the bubble sizes to the full name and is then shifted over whichever
    // icon is hovered.
    labelAnchor: {
      position: 'absolute',
      top: LABEL_TOP,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 2,
    },
    label: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 28,
      backgroundColor: token(
        AmityColorToken.SurfaceReactionsReactionPopoverReactionNameActive
      ),
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
