import { StyleSheet } from 'react-native';
import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';

export type MenuContainer = 'popover' | 'drawer';
export type MenuVariant = 'social' | 'chat';

type UseStylesArgs = {
  container?: MenuContainer;
  variant?: MenuVariant;
  destructive?: boolean;
};

// Web geometry (Menu.module.css, rem × 16). The web cascade is flattened here
// into explicit per-combination values since RN has no descendant selectors.
export const useStyles = ({
  container = 'popover',
  variant = 'social',
  destructive = false,
}: UseStylesArgs) => {
  const token = useToken();

  // --- .menu padding ---------------------------------------------------------
  // base: 0.5rem 0; drawer: 0; chat popover: 0.
  let menuPaddingVertical = 8;
  if (container === 'drawer') menuPaddingVertical = 0;
  else if (variant === 'chat') menuPaddingVertical = 0;

  // --- .menuItem geometry ----------------------------------------------------
  // base: gap 0.75rem (12), padding 0.875rem 1rem (14/16).
  let gap = 12;
  let paddingVertical = 14;
  let paddingHorizontal = 16;
  let borderRadius = 0;
  if (container === 'drawer') {
    // .menu[data-container='drawer'] .menuItem { padding: 0.875rem 0; }
    paddingHorizontal = 0;
  } else if (variant === 'chat') {
    // chat popover: padding 0.75rem (12); border-radius 0.5rem (8).
    paddingVertical = 12;
    paddingHorizontal = 12;
    borderRadius = 8;
  } else {
    // social popover: gap 0.5rem (8); padding 1rem (16).
    gap = 8;
    paddingVertical = 16;
    paddingHorizontal = 16;
  }

  // --- icon size -------------------------------------------------------------
  // base 1.5rem (24); chat popover 1.25rem (20).
  const iconSize = container === 'popover' && variant === 'chat' ? 20 : 24;

  // --- colour: menuItem[data-destructive] ------------------------------------
  const labelColorToken = destructive
    ? AmityColorToken.TextListHeaderDestructiveDefault
    : AmityColorToken.TextListHeaderDefaultDefault;

  const styles = StyleSheet.create({
    menu: {
      paddingVertical: menuPaddingVertical,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap,
      paddingVertical,
      paddingHorizontal,
      borderRadius,
    },
    menuItemLabel: {
      color: token(labelColorToken),
    },
    // .menuItem--skeleton — non-interactive placeholder row.
    menuItemSkeleton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap,
      paddingVertical,
      paddingHorizontal,
      borderRadius,
    },
  });

  return { styles, token, iconSize, labelColorToken };
};
