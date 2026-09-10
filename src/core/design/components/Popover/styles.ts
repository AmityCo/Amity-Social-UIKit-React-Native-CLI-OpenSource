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
    // Web `.popover`: radius 0.75rem (12px), popover surface, box-shadow-04.
    // Web shadow colour is black-based; RN's default shadowColor is black, so
    // no colour literal is needed here.
    popover: {
      position: 'absolute',
      overflow: 'hidden',
      borderRadius: 12,
      // Web `.dialog` min-width 12.5rem = 200px.
      minWidth: 200,
      backgroundColor: token(AmityColorToken.SurfacePopoverBackgroundDefault),
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
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
