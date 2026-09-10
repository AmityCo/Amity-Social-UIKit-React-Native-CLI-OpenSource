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
    // Reaction-picker pill — its own floating surface (bg comes from ReactionPicker;
    // this adds the pill radius + shadow + compact content width).
    pickerCard: {
      alignSelf: 'flex-start',
      borderRadius: 20,
      overflow: 'hidden',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
    // Menu card — its own floating surface (mirrors the standard popover card).
    menuCard: {
      alignSelf: 'stretch',
      minWidth: 200,
      borderRadius: 12,
      overflow: 'hidden',
      padding: 4,
      backgroundColor: token(AmityColorToken.SurfacePopoverBackgroundDefault),
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
  });

  return { styles, token };
};
