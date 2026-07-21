// Button.Icon atom — ported from AmityUiKitWeb core/design/atoms/Button/Icon
// (Icon.tsx + Icon.module.css). A round icon-only button carrying the web
// [data-size] geometry scale and the styleType × hierarchy token matrix with
// interaction states. Web onPress → RN onPress; web [data-hovered] token swap →
// RN pressed slice; web [data-disabled] → RN disabled slice (same state pattern
// as the core Button atom). Colours resolve through design tokens (styles.ts).
//
// Web's `label` styleType and `general` hierarchy are not ported: no chat usage,
// and `label` has no icon-colour token in the web CSS. Supported combos are the
// five that ship IconButton tokens: filled/ghost/transparent × primary/secondary.

// 1. React / RN imports
import {
  Pressable,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

// 3. Internal imports
import { AmityIcon, type AmityIconName } from '../../../icons';
import { useStyles } from './styles';

// 4. Types
export type IconButtonStyleType = 'filled' | 'ghost' | 'transparent';
export type IconButtonHierarchy = 'primary' | 'secondary';
export type IconButtonSize = 16 | 20 | 24 | 32 | 40 | 48 | 64;

export type IconButtonProps = {
  /** Glyph name (mirrors web's `icon` node). */
  icon: AmityIconName;
  styleType?: IconButtonStyleType;
  hierarchy?: IconButtonHierarchy;
  size?: IconButtonSize;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  accessibilityLabel?: string;
  /** Layout-only override (e.g. absolute positioning at the call site). */
  style?: StyleProp<ViewStyle>;
};

// 5. Named function component
export function Icon({
  icon,
  styleType = 'filled',
  hierarchy = 'primary',
  size = 40,
  disabled = false,
  onPress,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const { styles, palette, glyph } = useStyles(styleType, hierarchy, size);

  const stateFor = (pressed: boolean) =>
    disabled ? palette.disabled : pressed ? palette.pressed : palette.enabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: stateFor(pressed).backgroundColor },
        style,
      ]}
    >
      {({ pressed }) => (
        <AmityIcon
          name={icon}
          size={glyph}
          color={stateFor(pressed).iconColor}
        />
      )}
    </Pressable>
  );
}
