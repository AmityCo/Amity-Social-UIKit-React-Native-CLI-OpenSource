import { StyleSheet } from 'react-native';
import { useToken, type ColorTokenRef } from '../../../theme/useToken';
import { AmityColorToken } from '../../../tokens/amity-color-tokens';
import type {
  IconButtonHierarchy,
  IconButtonSize,
  IconButtonStyleType,
} from './Icon';

// ── Geometry: ported 1:1 from AmityUiKitWeb core/design/atoms/Button/Icon/
// Icon.module.css [data-size='N'] (rem → px, x16). border-radius 9999px → fully
// round (container/2). The 1px transparent border in web is layout-only (never a
// visible colour) and is omitted here; the glyph fills the padded content box, so
// glyph = container - 2·padding — matching every existing hand-rolled chat icon
// button (32→24, 40 filled→24, 16→16). Size 40 filled has padding 0.5rem=8 (web
// special-case `[data-size='40'][data-style='filled']`); all other 40 use 4.
const GEOMETRY: Record<IconButtonSize, number> = {
  16: 0,
  20: 0,
  24: 0,
  32: 4,
  40: 4,
  48: 8,
  64: 16,
};

export type IconButtonVisualState = 'enabled' | 'pressed' | 'disabled';

// A token slice for one visual state. `surface` is optional because ghost has no
// resting/disabled surface token (transparent at rest; surface only on hover).
type IconStateTokens = {
  surface?: ColorTokenRef;
  icon: ColorTokenRef;
};

type IconToneSlice = Record<IconButtonVisualState, IconStateTokens>;

// (styleType, hierarchy) → token slice, resolving to the web IconButton token model
// (Surface = Enabled/Hover/Disabled, Icon = Default/Hovered/Disabled). Every name
// below is grep-confirmed to exist in amity-color-tokens.ts. RN has no hover, so
// `pressed` reuses the web Hover slice (same pattern as the core Button atom).
const SLICES: Partial<
  Record<`${IconButtonStyleType}-${IconButtonHierarchy}`, IconToneSlice>
> = {
  'filled-primary': {
    enabled: {
      surface: AmityColorToken.SurfaceIconButtonFilledPrimaryEnabled,
      icon: AmityColorToken.IconIconButtonFilledPrimaryDefault,
    },
    pressed: {
      surface: AmityColorToken.SurfaceIconButtonFilledPrimaryHover,
      icon: AmityColorToken.IconIconButtonFilledPrimaryHovered,
    },
    disabled: {
      surface: AmityColorToken.SurfaceIconButtonFilledPrimaryDisabled,
      icon: AmityColorToken.IconIconButtonFilledPrimaryDisabled,
    },
  },
  'filled-secondary': {
    enabled: {
      surface: AmityColorToken.SurfaceIconButtonFilledSecondaryEnabled,
      icon: AmityColorToken.IconIconButtonFilledSecondaryDefault,
    },
    pressed: {
      surface: AmityColorToken.SurfaceIconButtonFilledSecondaryHover,
      icon: AmityColorToken.IconIconButtonFilledSecondaryHovered,
    },
    disabled: {
      surface: AmityColorToken.SurfaceIconButtonFilledSecondaryDisabled,
      icon: AmityColorToken.IconIconButtonFilledSecondaryDisabled,
    },
  },
  'transparent-primary': {
    enabled: {
      surface: AmityColorToken.SurfaceIconButtonTransparentPrimaryEnabled,
      icon: AmityColorToken.IconIconButtonTransparentPrimaryDefault,
    },
    pressed: {
      surface: AmityColorToken.SurfaceIconButtonTransparentPrimaryHover,
      icon: AmityColorToken.IconIconButtonTransparentPrimaryHovered,
    },
    disabled: {
      surface: AmityColorToken.SurfaceIconButtonTransparentPrimaryDisabled,
      icon: AmityColorToken.IconIconButtonTransparentPrimaryDisabled,
    },
  },
  // ghost — transparent at rest + on disabled (no surface token); surface only on hover.
  'ghost-primary': {
    enabled: {
      icon: AmityColorToken.IconIconButtonGhostPrimaryDefault,
    },
    pressed: {
      surface: AmityColorToken.SurfaceIconButtonGhostPrimaryHover,
      icon: AmityColorToken.IconIconButtonGhostPrimaryHovered,
    },
    disabled: {
      icon: AmityColorToken.IconIconButtonGhostPrimaryDisabled,
    },
  },
  'ghost-secondary': {
    enabled: {
      icon: AmityColorToken.IconIconButtonGhostSecondaryDefault,
    },
    pressed: {
      surface: AmityColorToken.SurfaceIconButtonGhostSecondaryHover,
      icon: AmityColorToken.IconIconButtonGhostSecondaryHovered,
    },
    disabled: {
      icon: AmityColorToken.IconIconButtonGhostSecondaryDisabled,
    },
  },
};

export type IconResolvedState = {
  backgroundColor: string;
  iconColor: string;
};

export type IconButtonPalette = Record<
  IconButtonVisualState,
  IconResolvedState
>;

export const useStyles = (
  styleType: IconButtonStyleType,
  hierarchy: IconButtonHierarchy,
  size: IconButtonSize
) => {
  const token = useToken();

  const slice =
    SLICES[`${styleType}-${hierarchy}`] ??
    SLICES[`${styleType}-primary`] ??
    SLICES['filled-primary']!;

  const resolveState = (state: IconButtonVisualState): IconResolvedState => {
    const s = slice[state];
    return {
      backgroundColor: s.surface ? token(s.surface) : 'transparent',
      iconColor: token(s.icon),
    };
  };

  const palette: IconButtonPalette = {
    enabled: resolveState('enabled'),
    pressed: resolveState('pressed'),
    disabled: resolveState('disabled'),
  };

  // web `[data-size='40'][data-style='filled']` overrides padding to 8.
  const padding = size === 40 && styleType === 'filled' ? 8 : GEOMETRY[size];
  const glyph = size - padding * 2;

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      padding,
      borderRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return { styles, palette, glyph };
};
