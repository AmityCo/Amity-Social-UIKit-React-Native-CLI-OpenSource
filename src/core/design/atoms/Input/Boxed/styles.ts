import { StyleSheet } from 'react-native';
import { useToken, type ColorTokenRef } from '../../../theme/useToken';
import { AmityColorToken } from '../../../tokens/amity-color-tokens';

export type BoxedSize = 'medium' | 'small';
export type BoxedVariant = 'pill' | 'square' | 'rounded';
export type BoxedState = 'enabled' | 'focused' | 'invalid' | 'disabled';

// Boxed reuses the TextInput placeholder tokens but has no highlight modifier —
// only base / filled per state. Precedence: disabled > invalid > focused > enabled.
const PLACEHOLDER: Record<
  BoxedState,
  { base: ColorTokenRef; filled: ColorTokenRef }
> = {
  enabled: {
    base: AmityColorToken.TextInputTextInputPlaceholderEnabled,
    filled: AmityColorToken.TextInputTextInputPlaceholderEnabledFilled,
  },
  focused: {
    base: AmityColorToken.TextInputTextInputPlaceholderFocused,
    filled: AmityColorToken.TextInputTextInputPlaceholderFocusedFilled,
  },
  invalid: {
    base: AmityColorToken.TextInputTextInputPlaceholderError,
    filled: AmityColorToken.TextInputTextInputPlaceholderErrorFilled,
  },
  disabled: {
    base: AmityColorToken.TextInputTextInputPlaceholderDisabled,
    filled: AmityColorToken.TextInputTextInputPlaceholderDisabledFilled,
  },
};

// Geometry (SoT: Boxed.module.css, rem × 16).
const SIZE = {
  medium: { gap: 12, minHeight: 56, paddingV: 8, paddingH: 16 },
  small: { gap: 8, minHeight: 40, paddingV: 10, paddingH: 12 },
} as const;

const RADIUS: Record<BoxedVariant, number> = {
  pill: 9999,
  square: 8,
  rounded: 24,
};

type UseStylesArgs = {
  state: BoxedState;
  size: BoxedSize;
  variant: BoxedVariant;
  filled: boolean;
  multiline: boolean;
};

export const useStyles = ({
  state,
  size,
  variant,
  filled,
  multiline,
}: UseStylesArgs) => {
  const token = useToken();

  const slice = PLACEHOLDER[state];
  const textColor = token(filled ? slice.filled : slice.base);
  const g = SIZE[size];

  const styles = StyleSheet.create({
    boxed: {
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      gap: g.gap,
      width: '100%',
      minHeight: g.minHeight,
      paddingVertical: g.paddingV,
      paddingHorizontal: g.paddingH,
      borderRadius: RADIUS[variant],
      borderWidth: 1,
      borderColor:
        state === 'invalid'
          ? token(AmityColorToken.BorderInputBoxedInputError)
          : 'transparent',
      backgroundColor: token(AmityColorToken.SurfaceInputBoxedInputDefault),
    },
    icon: {
      width: 20,
      height: 20,
      flexShrink: 0,
    },
    input: {
      flex: 1,
      minWidth: 0,
      padding: 0,
      fontSize: 16,
      color: textColor,
    },
  });

  return {
    styles,
    token,
    placeholderColor: textColor,
    cursorColor: token(AmityColorToken.TextInputTextInputTextCursorDefault),
  };
};
