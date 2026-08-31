// Menu — ported from AmityUiKitWeb core/design/components/Menu.
// Web renders a <div> wrapper whose CSS descendant selectors style each row by
// the parent's data-container / data-variant. RN has no cascade, so the parent
// pushes those two axes to rows through context. `Menu.Item` is an icon + label
// row (tinted per destructive flag); `Menu.Item.Skeleton` is the loading row.

import { createContext, useContext, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { AmityIcon, type AmityIconName } from '../../icons';
import { Typography, type TypographyVariant } from '../Typography';
import { Skeleton } from '../Skeleton';
import { useStyles, type MenuContainer, type MenuVariant } from './styles';

type MenuContextValue = {
  container: MenuContainer;
  variant: MenuVariant;
};

const MenuContext = createContext<MenuContextValue>({
  container: 'popover',
  variant: 'social',
});

type MenuProps = {
  children: ReactNode;
  container?: MenuContainer;
  variant?: MenuVariant;
};

export function Menu({
  children,
  container = 'popover',
  variant = 'social',
}: MenuProps) {
  const { styles } = useStyles({ container, variant });

  return (
    <MenuContext.Provider value={{ container, variant }}>
      <View style={styles.menu}>{children}</View>
    </MenuContext.Provider>
  );
}

type MenuItemProps = {
  label: string;
  icon?: AmityIconName;
  destructive?: boolean;
  onPress: () => void;
  typography?: TypographyVariant;
};

function MenuItem({
  label,
  icon,
  destructive = false,
  onPress,
  typography = 'bodyBold',
}: MenuItemProps) {
  const { container, variant } = useContext(MenuContext);
  const { styles, iconSize, labelColorToken } = useStyles({
    container,
    variant,
    destructive,
  });

  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      {icon ? (
        <AmityIcon name={icon} size={iconSize} tokenColor={labelColorToken} />
      ) : null}
      <Typography variant={typography} style={styles.menuItemLabel}>
        {label}
      </Typography>
    </Pressable>
  );
}

Menu.Item = MenuItem;

function MenuItemSkeleton() {
  const { container, variant } = useContext(MenuContext);
  const { styles } = useStyles({ container, variant });

  return (
    <View style={styles.menuItemSkeleton} accessibilityElementsHidden>
      {/* Web Skeleton.Line height 0.625rem (10px), full width. */}
      <Skeleton height={10} width="100%" />
    </View>
  );
}

MenuItem.Skeleton = MenuItemSkeleton;
