import { StyleSheet } from 'react-native';
import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // Full-screen backdrop; tapping it closes the popover.
    backdrop: {
      flex: 1,
    },
    // The floating card: radius 12, popover surface, elevation-04 shadow.
    // RN's default shadowColor is black, so no colour literal is needed here.
    //
    // Deliberately NO `overflow: 'hidden'` on this view. On iOS that sets
    // clipsToBounds, which clips the layer's own shadow away; Android draws from
    // `elevation` instead and is unaffected. Losing the shadow is not a cosmetic
    // detail here: Surface/Popover/Background/Default is pure white in the light
    // theme, exactly like the page behind it, so the shadow is the ONLY thing
    // that draws the card's outline. Without it the card has no visible corners
    // and no visible right edge, and the menu reads as square and flush against
    // the screen. Clipping lives on `clip` below so the shadow and the clip are
    // never on the same layer.
    popover: {
      position: 'absolute',
      borderRadius: 12,
      // Matches the menu/dialog content min-width.
      minWidth: 200,
      backgroundColor: token(AmityColorToken.SurfacePopoverBackgroundDefault),
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
    // Inner clipping layer — keeps arbitrary popover content inside the rounded
    // corners. It carries no shadow, so clipping here costs nothing.
    clip: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    // surface={false}: positioning only, no card surface — lets the caller render
    // its own separate floating surfaces (web MessageActionsPopover: a transparent
    // Dialog holding a reaction-picker pill above a menu card, two distinct surfaces).
    popoverBare: {
      position: 'absolute',
      minWidth: 200,
    },
  });

  return { styles, token };
};
