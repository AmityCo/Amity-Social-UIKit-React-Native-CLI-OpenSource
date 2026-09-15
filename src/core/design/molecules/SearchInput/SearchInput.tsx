// SearchInput molecule — ported from AmityUiKitWeb core/design/molecules/SearchInput.
// Composes the Boxed input atom (size=small, variant=square) with a leading
// search glyph and a trailing clear button that appears only when there is text.

import { Pressable } from 'react-native';
import { Boxed } from '../../atoms/Input';
import { AmityIcon } from '../../icons';
import { ICON_TOKEN, useStyles } from './styles';

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Custom clear handler; defaults to clearing the value via onChange(''). */
  onClear?: () => void;
  placeholder?: string;
  maxLength?: number;
  accessibilityLabel?: string;
  clearAccessibilityLabel?: string;
};

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder,
  maxLength,
  accessibilityLabel,
  clearAccessibilityLabel = 'Clear search',
}: SearchInputProps) {
  const { styles } = useStyles();

  return (
    <Boxed
      size="small"
      variant="square"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel ?? placeholder}
      maxLength={maxLength}
      leadingIcon={
        <AmityIcon name="search-r" size={20} tokenColor={ICON_TOKEN} />
      }
      trailingIcon={
        value ? (
          <Pressable
            style={styles.clearButton}
            onPress={onClear ?? (() => onChange(''))}
            accessibilityRole="button"
            accessibilityLabel={clearAccessibilityLabel}
          >
            <AmityIcon name="clear-r" size={20} tokenColor={ICON_TOKEN} />
          </Pressable>
        ) : undefined
      }
    />
  );
}
