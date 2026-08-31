// Button atom — ported from AmityUiKitWeb core/design/atoms/Button (Main).
// Public API follows the SoT design spec (geometry.json button.main.properties):
// hierarchy (primary/secondary/tertiary) × tone (default/destructive/brand/inverse/subtle)
// × size (lg/sm) × state (default/disabled). Web onClick → RN onPress; RN Pressable + Text
// (+ optional AmityIcon), never button/div. Colors resolve through design tokens (styles.ts).

// 1. React / RN imports
import React from 'react';
import {
  Pressable,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

// 3. Internal imports
import { AmityIcon, type AmityIconName } from '../../icons';
import { useStyles } from './styles';

// 4. Types
export type ButtonHierarchy = 'primary' | 'secondary' | 'tertiary';
export type ButtonTone =
  | 'default'
  | 'destructive'
  | 'brand'
  | 'inverse'
  | 'subtle';
export type ButtonSize = 'lg' | 'sm';

export type ButtonProps = {
  hierarchy?: ButtonHierarchy;
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Text label. Takes precedence over `children` when both are provided. */
  label?: string;
  children?: React.ReactNode;
  /** Leading icon (or the sole glyph when `iconOnly`). */
  icon?: AmityIconName;
  /** Render as a square icon-only button (no label). */
  iconOnly?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Layout-only override applied after the container style (e.g. alignSelf). */
  style?: StyleProp<ViewStyle>;
  onPress?: (event: GestureResponderEvent) => void;
};

// 5. Named function component
export function Button({
  hierarchy = 'primary',
  tone = 'default',
  size = 'lg',
  label,
  children,
  icon,
  iconOnly = false,
  disabled = false,
  fullWidth = false,
  style,
  onPress,
}: ButtonProps) {
  const content = label ?? children;
  const isIconOnly = iconOnly || (!!icon && content == null);
  const { styles, palette, iconGlyph } = useStyles(
    hierarchy,
    tone,
    size,
    isIconOnly,
    fullWidth
  );

  const stateFor = (pressed: boolean) =>
    disabled ? palette.disabled : pressed ? palette.pressed : palette.enabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => {
        const s = stateFor(pressed);
        return [
          styles.container,
          { backgroundColor: s.backgroundColor, borderColor: s.borderColor },
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const s = stateFor(pressed);
        return (
          <>
            {icon ? (
              <AmityIcon name={icon} size={iconGlyph} color={s.iconColor} />
            ) : null}
            {!isIconOnly && content != null ? (
              typeof content === 'string' ? (
                <Text style={[styles.label, { color: s.textColor }]}>
                  {content}
                </Text>
              ) : (
                content
              )
            ) : null}
          </>
        );
      }}
    </Pressable>
  );
}
