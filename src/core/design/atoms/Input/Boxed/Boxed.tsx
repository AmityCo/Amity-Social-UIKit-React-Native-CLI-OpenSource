// Boxed input atom — ported from AmityUiKitWeb core/design/atoms/Input/Boxed.
// A filled container field (pill / square / rounded) with optional leading and
// trailing icons. Web's :focus-within cascade becomes explicit focus state.

import { useState, type ReactNode } from 'react';
import { TextInput, View } from 'react-native';
import {
  useStyles,
  type BoxedSize,
  type BoxedState,
  type BoxedVariant,
} from './styles';

export type { BoxedSize, BoxedVariant } from './styles';

export type BoxedProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  size?: BoxedSize;
  variant?: BoxedVariant;
  maxLength?: number;
  multiline?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: (value: string) => void;
  accessibilityLabel?: string;
};

export function Boxed({
  value,
  onChange,
  placeholder,
  leadingIcon,
  trailingIcon,
  size = 'medium',
  variant = 'pill',
  maxLength,
  multiline = false,
  isDisabled = false,
  isInvalid = false,
  onFocus,
  onBlur,
  onSubmit,
  accessibilityLabel,
}: BoxedProps) {
  const [isFocused, setIsFocused] = useState(false);

  const state: BoxedState = isDisabled
    ? 'disabled'
    : isInvalid
    ? 'invalid'
    : isFocused
    ? 'focused'
    : 'enabled';

  const { styles, placeholderColor, cursorColor } = useStyles({
    state,
    size,
    variant,
    filled: !!value,
    multiline,
  });

  return (
    <View style={styles.boxed}>
      {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        selectionColor={cursorColor}
        cursorColor={cursorColor}
        maxLength={maxLength}
        multiline={multiline}
        editable={!isDisabled}
        accessibilityLabel={accessibilityLabel}
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
    </View>
  );
}
