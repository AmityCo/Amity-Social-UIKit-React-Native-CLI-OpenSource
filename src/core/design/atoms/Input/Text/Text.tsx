// Text input atom — ported from AmityUiKitWeb core/design/atoms/Input/Text.
// Underlined text field with optional title, counter, hint, and leading/trailing
// icons. Web's :focus-within cascade becomes explicit focus state here; the
// state × modifier colour matrix lives in styles.ts.

import { useState, type ReactNode } from 'react';
import { TextInput, View, Text as RNText } from 'react-native';
import { useStyles, type TextState } from './styles';

export type TextProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  title?: string;
  optionalLabel?: string;
  hintText?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  showCharacterCount?: boolean;
  maxLength?: number;
  multiLine?: boolean;
  /** Strip line breaks from the value as it is entered. `multiLine` controls how
   *  the text *wraps*; this controls whether the user may start a new line at all,
   *  so a field can wrap long text while still refusing Enter (PDT-5228). Applied
   *  on change rather than on key press because Android does not reliably report a
   *  cancellable Enter, and because it also catches a pasted multi-line string. */
  blockNewLine?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  highlightMatch?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: (value: string) => void;
  accessibilityLabel?: string;
};

export function Text({
  value,
  onChange,
  placeholder,
  title,
  optionalLabel,
  hintText,
  leadingIcon,
  trailingIcon,
  showCharacterCount = false,
  maxLength,
  multiLine = false,
  blockNewLine = false,
  isDisabled = false,
  isInvalid = false,
  highlightMatch = false,
  onFocus,
  onBlur,
  onSubmit,
  accessibilityLabel,
}: TextProps) {
  const [isFocused, setIsFocused] = useState(false);

  const state: TextState = isDisabled
    ? 'disabled'
    : isInvalid
    ? 'invalid'
    : isFocused
    ? 'focused'
    : 'enabled';

  const { styles, placeholderColor, cursorColor } = useStyles({
    state,
    filled: !!value,
    highlight: highlightMatch,
    multiLine,
  });

  function handleChangeText(next: string) {
    onChange?.(blockNewLine ? next.replace(/[\r\n]+/g, '') : next);
  }

  const counter = showCharacterCount ? (
    <RNText style={styles.count}>
      {value?.length ?? 0}
      {maxLength ? `/${maxLength}` : ''}
    </RNText>
  ) : null;

  return (
    <View style={styles.field}>
      {title ? (
        <View style={styles.titleRow}>
          <RNText style={styles.title}>
            {title}
            {optionalLabel ? (
              <RNText style={styles.optional}> {optionalLabel}</RNText>
            ) : null}
          </RNText>
          {counter}
        </View>
      ) : null}
      <View style={styles.row}>
        {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          selectionColor={cursorColor}
          cursorColor={cursorColor}
          maxLength={maxLength}
          multiline={multiLine}
          editable={!isDisabled}
          accessibilityLabel={accessibilityLabel ?? title}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onSubmitEditing={() => onSubmit?.(value ?? '')}
        />
        {trailingIcon ? <View style={styles.icon}>{trailingIcon}</View> : null}
        {!title ? counter : null}
      </View>
      {hintText ? <RNText style={styles.hint}>{hintText}</RNText> : null}
    </View>
  );
}
