// Styles for AmityMessageActionMenu — ported from web MessageActionsPopover.
// Web's Dialog is a transparent `.messageActionsPopover` (flex column, 0.5rem gap)
// holding TWO independent floating surfaces: a reaction-picker pill above a menu
// card. We render on a surface-less Popover (`surface={false}`) and give each block
// its OWN surface (bg + radius + shadow) so they read as two separate floating
// elements — not one shared card. Colours resolve through design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // Transparent stack (surface-less popover): picker above menu, 0.5rem→8 gap.
    content: {
      flexDirection: 'column',
      gap: 8,
    },
    // Reaction-picker slot — positioning ONLY.
    //
    // This used to add a radius, a clip and a second shadow on top of the ones
    // ReactionPicker's own pill already draws. The clip is what forced the
    // picker to reserve a transparent band above its pill so the floating
    // label would not be cropped, and this box then drew its shadow around that
    // empty band — a grey bar hanging above the picker, with the pill pushed
    // ~44px off the bubble whenever the popover opened below a message. The
    // pill supplies the whole surface (background, 9999 radius, elevation-08
    // shadow), so this wrapper has nothing left to draw and nothing to clip.
    pickerCard: {
      alignSelf: 'flex-start',
    },
    // Menu card — its own floating surface (mirrors the standard popover card).
    //
    // No `overflow: 'hidden'` here: on iOS that sets clipsToBounds, which clips
    // the layer's own shadow away, so the card rendered completely flat. Android
    // draws from `elevation` instead and was unaffected, which is why only iOS
    // looked wrong. The clip was not buying anything either — Menu.Item carries
    // its own borderRadius 8 and the card's 4px padding already insets every row
    // inside the 12px corner.
    menuCard: {
      alignSelf: 'stretch',
      minWidth: 200,
      borderRadius: 12,
      padding: 4,
      backgroundColor: token(AmityColorToken.SurfacePopoverBackgroundDefault),
      shadowColor: 'rgb(41, 43, 50)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
  });

  return { styles, token };
};
