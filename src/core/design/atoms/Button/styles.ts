import { StyleSheet } from 'react-native';
import { useToken, type ColorTokenRef } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';
import type { ButtonHierarchy, ButtonSize, ButtonTone } from './Button';

// ── Geometry: SoT geometry.json → button.main ──
// label sizes lg {15/20} sm {13/18}; iconGlyph 16; weight 590 → RN '600'.
// Tertiary uses paddingH_tertiary (4) but keeps full height + paddingV (ghost-like,
// NOT link-like). Border width 0.0625rem = 1px.
const GEOMETRY = {
  lg: {
    height: 40,
    paddingV: 10,
    paddingH: 12,
    paddingHTertiary: 4,
    radius: 8,
    fontSize: 15,
    lineHeight: 20,
    gap: 8,
  },
  sm: {
    height: 28,
    paddingV: 4,
    paddingH: 8,
    paddingHTertiary: 4,
    radius: 6,
    fontSize: 13,
    lineHeight: 18,
    gap: 4,
  },
} as const;

const ICON_GLYPH = 16;
const BORDER_WIDTH = 1;
const FONT_WEIGHT = '600' as const;

export type ButtonVisualState = 'enabled' | 'pressed' | 'disabled';

// A token slice for one visual state. `surface`/`border` are optional because
// ghost/link tones have no resting surface or border token (transparent at rest;
// ghost gains a surface only on hover/press).
type StateTokens = {
  surface?: ColorTokenRef;
  border?: ColorTokenRef;
  text: ColorTokenRef;
  icon: ColorTokenRef;
};

type ToneSlice = Record<ButtonVisualState, StateTokens>;

// (hierarchy, tone) → token slice, resolving to the web MainButton token model
// (color × styleType × tokenHierarchy). Every name below is grep-confirmed to exist
// in amity-color-tokens.ts. RN has no hover, so `pressed` reuses the web Hover slice.
const SLICES: Partial<Record<`${ButtonHierarchy}-${ButtonTone}`, ToneSlice>> = {
  // Primary → Filled / Primary
  'primary-default': {
    enabled: {
      surface: AmityColorToken.SurfaceMainButtonDefaultFilledPrimaryEnabled,
      border: AmityColorToken.BorderMainButtonDefaultFilledPrimaryEnabled,
      text: AmityColorToken.TextMainButtonDefaultFilledPrimaryEnabled,
      icon: AmityColorToken.IconMainButtonDefaultFilledPrimaryEnabled,
    },
    pressed: {
      surface: AmityColorToken.SurfaceMainButtonDefaultFilledPrimaryHover,
      border: AmityColorToken.BorderMainButtonDefaultFilledPrimaryHover,
      text: AmityColorToken.TextMainButtonDefaultFilledPrimaryHover,
      icon: AmityColorToken.IconMainButtonDefaultFilledPrimaryHover,
    },
    disabled: {
      surface: AmityColorToken.SurfaceMainButtonDefaultFilledPrimaryDisabled,
      border: AmityColorToken.BorderMainButtonDefaultFilledPrimaryDisabled,
      text: AmityColorToken.TextMainButtonDefaultFilledPrimaryDisabled,
      icon: AmityColorToken.IconMainButtonDefaultFilledPrimaryDisabled,
    },
  },
  'primary-destructive': {
    enabled: {
      surface: AmityColorToken.SurfaceMainButtonDestructiveFilledPrimaryEnabled,
      border: AmityColorToken.BorderMainButtonDestructiveFilledPrimaryEnabled,
      text: AmityColorToken.TextMainButtonDestructiveFilledPrimaryEnabled,
      icon: AmityColorToken.IconMainButtonDestructiveFilledPrimaryEnabled,
    },
    pressed: {
      surface: AmityColorToken.SurfaceMainButtonDestructiveFilledPrimaryHover,
      border: AmityColorToken.BorderMainButtonDestructiveFilledPrimaryHover,
      text: AmityColorToken.TextMainButtonDestructiveFilledPrimaryHover,
      icon: AmityColorToken.IconMainButtonDestructiveFilledPrimaryHover,
    },
    disabled: {
      surface:
        AmityColorToken.SurfaceMainButtonDestructiveFilledPrimaryDisabled,
      border: AmityColorToken.BorderMainButtonDestructiveFilledPrimaryDisabled,
      text: AmityColorToken.TextMainButtonDestructiveFilledPrimaryDisabled,
      icon: AmityColorToken.IconMainButtonDestructiveFilledPrimaryDisabled,
    },
  },

  // Secondary → Outlined / Primary (transparent surface + border)
  'secondary-default': {
    enabled: {
      surface: AmityColorToken.SurfaceMainButtonDefaultOutlinedPrimaryEnabled,
      border: AmityColorToken.BorderMainButtonDefaultOutlinedPrimaryEnabled,
      text: AmityColorToken.TextMainButtonDefaultOutlinedPrimaryEnabled,
      icon: AmityColorToken.IconMainButtonDefaultOutlinedPrimaryEnabled,
    },
    pressed: {
      surface: AmityColorToken.SurfaceMainButtonDefaultOutlinedPrimaryHover,
      border: AmityColorToken.BorderMainButtonDefaultOutlinedPrimaryHover,
      text: AmityColorToken.TextMainButtonDefaultOutlinedPrimaryHover,
      icon: AmityColorToken.IconMainButtonDefaultOutlinedPrimaryHover,
    },
    disabled: {
      surface: AmityColorToken.SurfaceMainButtonDefaultOutlinedPrimaryDisabled,
      border: AmityColorToken.BorderMainButtonDefaultOutlinedPrimaryDisabled,
      text: AmityColorToken.TextMainButtonDefaultOutlinedPrimaryDisabled,
      icon: AmityColorToken.IconMainButtonDefaultOutlinedPrimaryDisabled,
    },
  },
  'secondary-destructive': {
    enabled: {
      surface:
        AmityColorToken.SurfaceMainButtonDestructiveOutlinedPrimaryEnabled,
      border: AmityColorToken.BorderMainButtonDestructiveOutlinedPrimaryEnabled,
      text: AmityColorToken.TextMainButtonDestructiveOutlinedPrimaryEnabled,
      icon: AmityColorToken.IconMainButtonDestructiveOutlinedPrimaryEnabled,
    },
    pressed: {
      surface: AmityColorToken.SurfaceMainButtonDestructiveOutlinedPrimaryHover,
      border: AmityColorToken.BorderMainButtonDestructiveOutlinedPrimaryHover,
      text: AmityColorToken.TextMainButtonDestructiveOutlinedPrimaryHover,
      icon: AmityColorToken.IconMainButtonDestructiveOutlinedPrimaryHover,
    },
    disabled: {
      surface:
        AmityColorToken.SurfaceMainButtonDestructiveOutlinedPrimaryDisabled,
      border:
        AmityColorToken.BorderMainButtonDestructiveOutlinedPrimaryDisabled,
      text: AmityColorToken.TextMainButtonDestructiveOutlinedPrimaryDisabled,
      icon: AmityColorToken.IconMainButtonDestructiveOutlinedPrimaryDisabled,
    },
  },
  // Secondary / Inverse → Inverse / Primary (extension)
  'secondary-inverse': {
    enabled: {
      surface: AmityColorToken.SurfaceMainButtonDefaultInversePrimaryEnabled,
      border: AmityColorToken.BorderMainButtonDefaultInversePrimaryEnabled,
      text: AmityColorToken.TextMainButtonDefaultInversePrimaryEnabled,
      icon: AmityColorToken.IconMainButtonDefaultInversePrimaryEnabled,
    },
    pressed: {
      surface: AmityColorToken.SurfaceMainButtonDefaultInversePrimaryHover,
      border: AmityColorToken.BorderMainButtonDefaultInversePrimaryHover,
      text: AmityColorToken.TextMainButtonDefaultInversePrimaryHover,
      icon: AmityColorToken.IconMainButtonDefaultInversePrimaryHover,
    },
    disabled: {
      surface: AmityColorToken.SurfaceMainButtonDefaultInversePrimaryDisabled,
      border: AmityColorToken.BorderMainButtonDefaultInversePrimaryDisabled,
      text: AmityColorToken.TextMainButtonDefaultInversePrimaryDisabled,
      icon: AmityColorToken.IconMainButtonDefaultInversePrimaryDisabled,
    },
  },

  // Tertiary → Ghost / Primary (no resting surface/border; surface only on press)
  'tertiary-default': {
    enabled: {
      text: AmityColorToken.TextMainButtonDefaultGhostPrimaryEnabled,
      icon: AmityColorToken.IconMainButtonDefaultGhostPrimaryEnabled,
    },
    pressed: {
      surface: AmityColorToken.SurfaceMainButtonDefaultGhostPrimaryHover,
      border: AmityColorToken.BorderMainButtonDefaultGhostPrimaryHover,
      text: AmityColorToken.TextMainButtonDefaultGhostPrimaryHover,
      icon: AmityColorToken.IconMainButtonDefaultGhostPrimaryHover,
    },
    disabled: {
      text: AmityColorToken.TextMainButtonDefaultGhostPrimaryDisabled,
      icon: AmityColorToken.IconMainButtonDefaultGhostPrimaryDisabled,
    },
  },
  'tertiary-destructive': {
    enabled: {
      text: AmityColorToken.TextMainButtonDestructiveGhostPrimaryEnabled,
      icon: AmityColorToken.IconMainButtonDestructiveGhostPrimaryEnabled,
    },
    pressed: {
      surface: AmityColorToken.SurfaceMainButtonDestructiveGhostPrimaryHover,
      border: AmityColorToken.BorderMainButtonDestructiveGhostPrimaryHover,
      text: AmityColorToken.TextMainButtonDestructiveGhostPrimaryHover,
      icon: AmityColorToken.IconMainButtonDestructiveGhostPrimaryHover,
    },
    disabled: {
      text: AmityColorToken.TextMainButtonDestructiveGhostPrimaryDisabled,
      icon: AmityColorToken.IconMainButtonDestructiveGhostPrimaryDisabled,
    },
  },
  // Tertiary / Brand → Link / Primary (brand-colored text; ghost geometry) (extension)
  'tertiary-brand': {
    enabled: {
      text: AmityColorToken.TextMainButtonDefaultLinkPrimaryEnabled,
      icon: AmityColorToken.IconMainButtonDefaultLinkPrimaryEnabled,
    },
    pressed: {
      text: AmityColorToken.TextMainButtonDefaultLinkPrimaryHover,
      icon: AmityColorToken.IconMainButtonDefaultLinkPrimaryHover,
    },
    disabled: {
      text: AmityColorToken.TextMainButtonDefaultLinkPrimaryDisabled,
      icon: AmityColorToken.IconMainButtonDefaultLinkPrimaryDisabled,
    },
  },
  // Tertiary / Subtle → Ghost / Secondary (muted text) (extension)
  'tertiary-subtle': {
    enabled: {
      text: AmityColorToken.TextMainButtonDefaultGhostSecondaryEnabled,
      icon: AmityColorToken.IconMainButtonDefaultGhostSecondaryEnabled,
    },
    pressed: {
      surface: AmityColorToken.SurfaceMainButtonDefaultGhostSecondaryHover,
      border: AmityColorToken.BorderMainButtonDefaultGhostSecondaryHover,
      text: AmityColorToken.TextMainButtonDefaultGhostSecondaryHover,
      icon: AmityColorToken.IconMainButtonDefaultGhostSecondaryHover,
    },
    disabled: {
      text: AmityColorToken.TextMainButtonDefaultGhostSecondaryDisabled,
      icon: AmityColorToken.IconMainButtonDefaultGhostSecondaryDisabled,
    },
  },
  // Note: tertiary-inverse has no clean token (Inverse styleType is filled-surface,
  // the tertiary/inverse spec is transparent text-only) — deferred. Falls back to
  // tertiary-default below.
};

export type ResolvedState = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
};

export type ButtonPalette = Record<ButtonVisualState, ResolvedState>;

export const useStyles = (
  hierarchy: ButtonHierarchy,
  tone: ButtonTone,
  size: ButtonSize,
  iconOnly: boolean,
  fullWidth: boolean
) => {
  const token = useToken();
  const g = GEOMETRY[size];

  const slice =
    SLICES[`${hierarchy}-${tone}`] ??
    SLICES[`${hierarchy}-default`] ??
    SLICES['primary-default']!;

  const resolveState = (state: ButtonVisualState): ResolvedState => {
    const s = slice[state];
    return {
      backgroundColor: s.surface ? token(s.surface) : 'transparent',
      borderColor: s.border ? token(s.border) : 'transparent',
      textColor: token(s.text),
      iconColor: token(s.icon),
    };
  };

  const palette: ButtonPalette = {
    enabled: resolveState('enabled'),
    pressed: resolveState('pressed'),
    disabled: resolveState('disabled'),
  };

  const paddingH = hierarchy === 'tertiary' ? g.paddingHTertiary : g.paddingH;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: g.gap,
      height: g.height,
      borderRadius: g.radius,
      borderWidth: BORDER_WIDTH,
      paddingVertical: g.paddingV,
      paddingHorizontal: iconOnly ? g.paddingV : paddingH,
      width: iconOnly ? g.height : fullWidth ? '100%' : undefined,
      alignSelf: fullWidth && !iconOnly ? 'stretch' : 'flex-start',
    },
    label: {
      fontSize: g.fontSize,
      lineHeight: g.lineHeight,
      fontWeight: FONT_WEIGHT,
    },
  });

  return { styles, palette, iconGlyph: ICON_GLYPH };
};
