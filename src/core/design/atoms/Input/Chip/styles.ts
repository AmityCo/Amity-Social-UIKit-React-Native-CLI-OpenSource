import { StyleSheet } from 'react-native';
import { useToken, type ColorTokenRef } from '../../../theme/useToken';
import { AmityColorToken } from '../../../tokens/amity-color-tokens';

// Chip has no focus state in the web CSS — only default / disabled / invalid.
export type ChipState = 'default' | 'disabled' | 'invalid';

const LINE: Record<ChipState, ColorTokenRef> = {
  default: AmityColorToken.LineInputChipInputUnderlinedDefault,
  disabled: AmityColorToken.LineInputChipInputUnderlinedDisabled,
  invalid: AmityColorToken.LineInputChipInputUnderlinedError,
};
const PLACEHOLDER: Record<ChipState, ColorTokenRef> = {
  default: AmityColorToken.TextInputChipInputPlaceholderEnabled,
  disabled: AmityColorToken.TextInputChipInputPlaceholderDisabled,
  invalid: AmityColorToken.TextInputChipInputPlaceholderError,
};
const TITLE: Record<ChipState, ColorTokenRef> = {
  default: AmityColorToken.TextInputChipInputTitleDefault,
  disabled: AmityColorToken.TextInputChipInputTitleDisabled,
  invalid: AmityColorToken.TextInputChipInputTitleError,
};
const INDICATOR: Record<ChipState, ColorTokenRef> = {
  default: AmityColorToken.TextInputChipInputIndicatorDefault,
  disabled: AmityColorToken.TextInputChipInputIndicatorDisabled,
  invalid: AmityColorToken.TextInputChipInputIndicatorError,
};

export const useStyles = (state: ChipState) => {
  const token = useToken();

  const titleColor = token(TITLE[state]);
  const placeholderColor = token(PLACEHOLDER[state]);
  const hintColor = token(
    state === 'invalid'
      ? AmityColorToken.TextInputChipInputHintTextError
      : AmityColorToken.TextInputChipInputHintTextDefault
  );

  const styles = StyleSheet.create({
    chip: {
      width: '100%',
      gap: 4,
    },
    title: {
      fontSize: 13,
      fontWeight: '600',
      color: titleColor,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    icon: {
      width: 20,
      height: 20,
      flexShrink: 0,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    tagLabel: {
      fontSize: 14,
      color: titleColor,
    },
    input: {
      flex: 1,
      minWidth: 64,
      padding: 0,
      fontSize: 16,
      color: placeholderColor,
    },
    underline: {
      width: '100%',
      height: 1,
      backgroundColor: token(LINE[state]),
    },
    hint: {
      fontSize: 12,
      color: hintColor,
    },
  });

  return {
    styles,
    token,
    placeholderColor,
    cursorColor: token(AmityColorToken.TextInputChipInputTextCursorDefault),
    removeIconColor: INDICATOR[state],
  };
};
