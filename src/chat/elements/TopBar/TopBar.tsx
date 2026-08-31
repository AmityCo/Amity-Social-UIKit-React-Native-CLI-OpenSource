// TopBar — ported from AmityUiKitWeb v4/chat/elements/TopBar.
// A generic top bar: a leading icon button (back chevron or close cross), a
// centered bold title, and an optional trailing slot.
//
// RN adaptations from web:
//   - Web `Button.Icon` (ghost/secondary) → a Pressable + AmityIcon tinted with
//     the Icon/IconButton/Ghost/Secondary token (matches the conversation Header).
//   - `<header>`/`<div>` → View. `position: sticky` has no RN equivalent and is
//     dropped — the hosting page lays the bar out at the top.

// 1. React / RN imports
import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../core/design/components/Typography';
import { AmityIcon } from '../../../core/design/icons';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';
import { useStyles } from './styles';

// 3. Types
type TopBarProps = {
  title: string;
  leadingType?: 'back' | 'close';
  onLeading: () => void;
  trailing?: ReactNode;
};

// 4. Named function component
export function TopBar({
  title,
  leadingType = 'back',
  onLeading,
  trailing,
}: TopBarProps) {
  const { styles } = useStyles();
  const isBack = leadingType === 'back';

  return (
    <View style={styles.topBar}>
      <View style={styles.leftAction}>
        <Pressable
          style={styles.iconButton}
          onPress={onLeading}
          accessibilityRole="button"
          accessibilityLabel={isBack ? 'Back' : 'Close'}
        >
          <AmityIcon
            name={isBack ? 'chevron-left' : 'cross-r'}
            size={24}
            tokenColor={AmityColorToken.IconIconButtonGhostSecondaryDefault}
          />
        </Pressable>
      </View>
      <Typography variant="titleBold" style={styles.title} numberOfLines={1}>
        {title}
      </Typography>
      <View style={styles.rightAction}>{trailing}</View>
    </View>
  );
}
