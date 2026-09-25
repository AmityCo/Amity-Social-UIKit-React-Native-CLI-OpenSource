// Tab atom — ported from AmityUiKitWeb core/design/atoms/Tab.
// One atom with three variants (pill, underlined, icon). Web react-aria Tab
// (selection + click) → RN Pressable + `active`/`onPress`. Hover and
// focus-visible are web-only interaction states and are intentionally omitted.

import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Pressable, Text, View } from 'react-native';
import { useStyles } from './styles';

export type TabVariant = 'pill' | 'underlined' | 'icon';

export type TabProps = {
  variant?: TabVariant;
  label?: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

export function Tab({
  variant = 'pill',
  label,
  icon,
  active = false,
  disabled = false,
  onPress,
}: TabProps) {
  const { styles, iconColor } = useStyles(variant, active, disabled);

  const tintedIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ color?: string }>, {
        color: iconColor,
      })
    : icon;

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="tab"
      accessibilityState={{ selected: active, disabled }}
    >
      {variant === 'icon' ? (
        <>
          <View style={styles.icon}>{tintedIcon}</View>
          <View style={styles.indicator} />
        </>
      ) : variant === 'underlined' ? (
        <>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.indicator} />
        </>
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}
