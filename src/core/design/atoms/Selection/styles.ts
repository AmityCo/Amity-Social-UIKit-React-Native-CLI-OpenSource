import { StyleSheet } from 'react-native';
import { useToken, type ColorTokenRef } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';

// Selection geometry (SoT: Checkbox/Radio .module.css, rem × 16).
//   outer control 1.5rem = 24, padding 0.125rem = 2 → inner circle 1.25rem = 20
//   circle border 0.0625rem = 1; check glyph 0.875rem = 14; radio dot 0.5rem = 8
//   row layout: checkbox minHeight 3.5rem = 56, padding 0.5rem 1rem = 8×16, gap 8
//               radio    padding 1rem = 16 (no minHeight),                gap 8
export type SelectionVariant = 'checkbox' | 'radio';

const CONTROL_SIZE = 24;
const CONTROL_PADDING = 2;
const CIRCLE_SIZE = 20;
const CHECK_SIZE = 14;
const DOT_SIZE = 8;

// Per-variant colour tokens (web CSS custom props → AmityColorToken refs).
type VariantTokens = {
  surfaceActiveDefault: ColorTokenRef;
  surfaceActiveDisabled: ColorTokenRef;
  surfaceInactiveDefault: ColorTokenRef;
  surfaceInactiveDisabled: ColorTokenRef;
  borderInactiveDefault: ColorTokenRef;
  borderInactiveDisabled: ColorTokenRef;
  iconDefault: ColorTokenRef;
  iconDisabled: ColorTokenRef;
};

const CHECKBOX_TOKENS: VariantTokens = {
  surfaceActiveDefault:
    AmityColorToken.SurfaceSelectionCheckboxAtomicActiveDefault,
  surfaceActiveDisabled:
    AmityColorToken.SurfaceSelectionCheckboxAtomicActiveDisabled,
  surfaceInactiveDefault:
    AmityColorToken.SurfaceSelectionCheckboxAtomicInactiveDefault,
  surfaceInactiveDisabled:
    AmityColorToken.SurfaceSelectionCheckboxAtomicInactiveDisabled,
  borderInactiveDefault:
    AmityColorToken.BorderSelectionCheckboxAtomicInactiveDefault,
  borderInactiveDisabled:
    AmityColorToken.BorderSelectionCheckboxAtomicInactiveDisabled,
  iconDefault: AmityColorToken.IconSelectionCheckboxAtomicDefault,
  iconDisabled: AmityColorToken.IconSelectionCheckboxAtomicDisabled,
};

const RADIO_TOKENS: VariantTokens = {
  surfaceActiveDefault:
    AmityColorToken.SurfaceSelectionRadioAtomicActiveDefault,
  surfaceActiveDisabled:
    AmityColorToken.SurfaceSelectionRadioAtomicActiveDisabled,
  surfaceInactiveDefault:
    AmityColorToken.SurfaceSelectionRadioAtomicInactiveDefault,
  surfaceInactiveDisabled:
    AmityColorToken.SurfaceSelectionRadioAtomicInactiveDisabled,
  borderInactiveDefault:
    AmityColorToken.BorderSelectionRadioAtomicInactiveDefault,
  borderInactiveDisabled:
    AmityColorToken.BorderSelectionRadioAtomicInactiveDisabled,
  iconDefault: AmityColorToken.IconSelectionRadioAtomicDefault,
  iconDisabled: AmityColorToken.IconSelectionRadioAtomicDisabled,
};

type UseStylesArgs = {
  variant: SelectionVariant;
  selected: boolean;
  disabled: boolean;
};

export const useStyles = ({ variant, selected, disabled }: UseStylesArgs) => {
  const token = useToken();
  const t = variant === 'checkbox' ? CHECKBOX_TOKENS : RADIO_TOKENS;

  // Precedence mirrors the web CSS cascade: selected+disabled > selected >
  // disabled > default. Border collapses to transparent whenever selected.
  const surfaceRef = selected
    ? disabled
      ? t.surfaceActiveDisabled
      : t.surfaceActiveDefault
    : disabled
    ? t.surfaceInactiveDisabled
    : t.surfaceInactiveDefault;

  const borderColor = selected
    ? 'transparent'
    : token(disabled ? t.borderInactiveDisabled : t.borderInactiveDefault);

  // Glyph tint (check icon / radio dot). Only rendered when selected.
  const iconRef = disabled ? t.iconDisabled : t.iconDefault;

  // Row padding differs between the two variants.
  const rowPadding =
    variant === 'checkbox'
      ? { paddingVertical: 8, paddingHorizontal: 16, minHeight: 56 }
      : { padding: 16 };

  const styles = StyleSheet.create({
    control: {
      width: CONTROL_SIZE,
      height: CONTROL_SIZE,
      padding: CONTROL_PADDING,
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      ...rowPadding,
    },
    circle: {
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      flexShrink: 0,
      borderRadius: CIRCLE_SIZE / 2,
      borderWidth: 1,
      borderColor,
      backgroundColor: token(surfaceRef),
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: token(iconRef),
    },
  });

  return { styles, token, iconRef, checkSize: CHECK_SIZE };
};
