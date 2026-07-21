// Styles for AmityMessageActionMenu — ported from web
// MessageActionsPopover.module.css. `content` mirrors `.messageActionsPopover`
// (flex column + 0.5rem→8 gap) so the reaction-picker block sits cleanly ABOVE
// the menu block with clear separation — without the gap the picker pill (which
// carries its own elevation/shadow) visually collides with the top of the menu.
// `menuContainer` mirrors `.messageActionsPopover__menu` inner padding
// (0.25rem → 4); its surface background, radius and shadow are supplied by the
// Wave-A Popover. Colours resolve through design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // .messageActionsPopover — vertical stack, 0.5rem gap between picker & menu.
    content: {
      flexDirection: 'column',
      gap: 8,
    },
    menuContainer: {
      padding: 4,
    },
  });

  return { styles, token };
};
