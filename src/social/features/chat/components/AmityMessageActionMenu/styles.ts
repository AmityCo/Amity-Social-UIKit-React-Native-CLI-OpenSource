// Styles for AmityMessageActionMenu — ported from web
// MessageActionsPopover.module.css `.messageActionsPopover__menu`. The surface
// background, radius and shadow are supplied by the Wave-A Popover; this only
// adds the inner padding (0.25rem → 4). Colours resolve through design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    menuContainer: {
      padding: 4,
    },
  });

  return { styles, token };
};
