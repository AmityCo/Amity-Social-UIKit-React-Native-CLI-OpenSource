// Chip input atom — ported from AmityUiKitWeb core/design/atoms/Input/Chip.
// A tag-entry field: existing chips render as removable tags, and submitting the
// input appends a new chip. Web's react-aria TagGroup becomes RN Views with a
// remove Pressable (cross-r glyph) per tag.

import { type ReactNode } from 'react';
import { Pressable, TextInput, View, Text as RNText } from 'react-native';
import { AmityIcon } from '../../../icons';
import { useStyles, type ChipState } from './styles';

export type ChipData = {
  id: string;
  label: string;
  disabled?: boolean;
};

export type ChipProps = {
  chips?: ChipData[];
  onChipsChange?: (chips: ChipData[]) => void;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  title?: string;
  hintText?: string;
  leadingIcon?: ReactNode;
  isDisabled?: boolean;
  isInvalid?: boolean;
  onSubmit?: (value: string) => void;
  accessibilityLabel?: string;
};

export function Chip({
  chips = [],
  onChipsChange,
  value,
  onChange,
  placeholder,
  title,
  hintText,
  leadingIcon,
  isDisabled = false,
  isInvalid = false,
  onSubmit,
  accessibilityLabel,
}: ChipProps) {
  const state: ChipState = isDisabled
    ? 'disabled'
    : isInvalid
    ? 'invalid'
    : 'default';

  const { styles, placeholderColor, cursorColor, removeIconColor } =
    useStyles(state);

  const removeChip = (id: string) => {
    onChipsChange?.(chips.filter((chip) => chip.id !== id));
  };

  const addChip = () => {
    const next = value?.trim();
    if (!next) return;
    onChipsChange?.([...chips, { id: next, label: next }]);
    onChange?.('');
    onSubmit?.(next);
  };

  return (
    <View style={styles.chip}>
      {title ? <RNText style={styles.title}>{title}</RNText> : null}
      <View style={styles.row}>
        {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
        {chips.map((chip) => (
          <View key={chip.id} style={styles.tag}>
            <RNText style={styles.tagLabel}>{chip.label}</RNText>
            <Pressable
              onPress={() => removeChip(chip.id)}
              accessibilityRole="button"
              accessibilityLabel="Remove"
            >
              <AmityIcon
                name="cross-r"
                size={14}
                tokenColor={removeIconColor}
              />
            </Pressable>
          </View>
        ))}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          selectionColor={cursorColor}
          cursorColor={cursorColor}
          editable={!isDisabled}
          accessibilityLabel={title ? undefined : accessibilityLabel}
          onSubmitEditing={addChip}
        />
      </View>
      <View style={styles.underline} />
      {hintText ? <RNText style={styles.hint}>{hintText}</RNText> : null}
    </View>
  );
}
