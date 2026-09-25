// Badge atom — ported from AmityUiKitWeb core/design/atoms/Badge.
// Compound namespace: Badge.Label (text pill) and Badge.Icon (icon chip).
// Shape/fill/size/border + optional semantic `preset` drive geometry (SoT
// geometry.json → badges) and colour (AmityColorToken via useToken).

import { View, Text } from 'react-native';
import { AmityIcon, type AmityIconName } from '../../icons';
import { resolveBadgeTokens, useStyles } from './styles';

export type BadgeShape = 'round' | 'square';
export type BadgeFill = 'filled' | 'ghost';
export type BadgeSize = 14 | 16 | 20 | 24 | 28 | 32;
export type BadgePreset = { family: string; case: string };

export type BadgeBaseProps = {
  shape?: BadgeShape;
  fill?: BadgeFill;
  size?: BadgeSize;
  border?: boolean;
  preset?: BadgePreset;
};

export type LabelProps = BadgeBaseProps & {
  label: string;
};

export type IconProps = BadgeBaseProps & {
  icon: AmityIconName;
  /**
   * Glyph size in px, overriding the default (chip size, or 75% of it when a
   * border ring is present). Icon-only badges are drawn from a sampled
   * per-size ramp in Figma rather than a formula, so a case whose render
   * disagrees with the default passes its measured value here.
   */
  glyphSize?: number;
};

export const presetSlug = (preset?: BadgePreset) =>
  preset ? `${preset.family}-${preset.case}`.toLowerCase() : undefined;

function Label({
  label,
  shape = 'round',
  fill = 'filled',
  size = 24,
  border = false,
  preset,
}: LabelProps) {
  const tokens = resolveBadgeTokens(presetSlug(preset));
  const { styles } = useStyles({
    variant: 'label',
    shape,
    fill,
    size,
    border,
    tokens,
  });

  return (
    <View style={styles.badge} accessibilityRole="none">
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function Icon({
  icon,
  shape = 'round',
  fill = 'filled',
  size = 24,
  border = false,
  preset,
  glyphSize: glyphSizeProp,
}: IconProps) {
  const tokens = resolveBadgeTokens(presetSlug(preset));
  const { styles } = useStyles({
    variant: 'icon',
    shape,
    fill,
    size,
    border,
    tokens,
  });

  // Web: glyph fills 100% of the chip, or 75% when a border ring is present.
  // An explicit `glyphSize` wins over both.
  const glyphSize = glyphSizeProp ?? (border ? Math.round(size * 0.75) : size);

  return (
    <View style={styles.badge} accessibilityRole="none">
      <AmityIcon name={icon} tokenColor={tokens.icon} size={glyphSize} />
    </View>
  );
}

export const Badge = {
  Label,
  Icon,
};
