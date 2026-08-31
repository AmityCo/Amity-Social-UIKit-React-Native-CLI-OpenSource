import { StyleSheet } from 'react-native';
import { useToken, type ColorTokenRef } from '../../../theme/useToken';
import { AmityColorToken } from '../../../tokens/amity-color-tokens';

// Web resolves text/placeholder colour through a state × modifier matrix of
// compound CSS selectors. RN has no cascade, so the matrix is replicated here.
// Precedence (from CSS specificity + source order):
//   state:    disabled > invalid > focused > enabled
//   modifier: highlight > filled
export type TextState = 'enabled' | 'focused' | 'invalid' | 'disabled';

const PLACEHOLDER: Record<
  TextState,
  { base: ColorTokenRef; filled: ColorTokenRef; highlight: ColorTokenRef }
> = {
  enabled: {
    base: AmityColorToken.TextInputTextInputPlaceholderEnabled,
    filled: AmityColorToken.TextInputTextInputPlaceholderEnabledFilled,
    highlight: AmityColorToken.TextInputTextInputPlaceholderEnabledHighlight,
  },
  focused: {
    base: AmityColorToken.TextInputTextInputPlaceholderFocused,
    filled: AmityColorToken.TextInputTextInputPlaceholderFocusedFilled,
    highlight: AmityColorToken.TextInputTextInputPlaceholderFocusedHighlight,
  },
  invalid: {
    base: AmityColorToken.TextInputTextInputPlaceholderError,
    filled: AmityColorToken.TextInputTextInputPlaceholderErrorFilled,
    highlight: AmityColorToken.TextInputTextInputPlaceholderErrorHighlight,
  },
  disabled: {
    base: AmityColorToken.TextInputTextInputPlaceholderDisabled,
    filled: AmityColorToken.TextInputTextInputPlaceholderDisabledFilled,
    highlight: AmityColorToken.TextInputTextInputPlaceholderDisabledHighlight,
  },
};

// Icon/line only change on invalid/disabled (web keeps default when focused).
const LINE: Record<TextState, ColorTokenRef> = {
  enabled: AmityColorToken.LineInputTextInputUnderlinedDefault,
  focused: AmityColorToken.LineInputTextInputUnderlinedDefault,
  invalid: AmityColorToken.LineInputTextInputUnderlinedError,
  disabled: AmityColorToken.LineInputTextInputUnderlinedDisabled,
};

const resolvePlaceholder = (
  state: TextState,
  filled: boolean,
  highlight: boolean
): ColorTokenRef => {
  const slice = PLACEHOLDER[state];
  if (highlight) return slice.highlight;
  if (filled) return slice.filled;
  return slice.base;
};

type UseStylesArgs = {
  state: TextState;
  filled: boolean;
  highlight: boolean;
  multiLine: boolean;
};

export const useStyles = ({
  state,
  filled,
  highlight,
  multiLine,
}: UseStylesArgs) => {
  const token = useToken();

  const textColor = token(resolvePlaceholder(state, filled, highlight));
  const hintColor = token(
    state === 'invalid'
      ? AmityColorToken.TextInputTextInputHintTextError
      : AmityColorToken.TextInputTextInputHintTextDefault
  );

  const styles = StyleSheet.create({
    field: {
      width: '100%',
      gap: 4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 4,
    },
    title: {
      color: token(AmityColorToken.TextInputTextInputTitleDefault),
      fontSize: 13,
      fontWeight: '600',
    },
    optional: {
      color: token(AmityColorToken.TextInputTextInputIndicatorDefault),
      fontSize: 13,
    },
    row: {
      flexDirection: 'row',
      alignItems: multiLine ? 'flex-start' : 'center',
      gap: 8,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: token(LINE[state]),
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
      fontSize: 15,
      lineHeight: 20,
      color: textColor,
    },
    count: {
      flexShrink: 0,
      color: token(AmityColorToken.TextInputTextInputTextCountDefault),
      fontSize: 13,
    },
    hint: {
      color: hintColor,
      fontSize: 13,
    },
  });

  return {
    styles,
    token,
    placeholderColor: textColor,
    cursorColor: token(AmityColorToken.TextInputTextInputTextCursorDefault),
  };
};
