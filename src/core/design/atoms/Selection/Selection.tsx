// Selection atom — ported from AmityUiKitWeb core/design/atoms/Selection.
// Compound namespace: Selection.Checkbox (toggles) and Selection.Radio (selects).
// Web builds these on react-aria; RN uses a Pressable + a token-tinted circle,
// rendering the check glyph / radio dot only while selected (web animated its
// opacity — same result). Web's RadioGroup wrapper is dropped: RN group state is
// owned by the parent, and Radio fires onSelect once rather than toggling.

import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { AmityIcon } from '../../icons';
import { useStyles } from './styles';

export type CheckboxProps = {
  isSelected?: boolean;
  onChange?: (selected: boolean) => void;
  isDisabled?: boolean;
  children?: ReactNode;
  accessibilityLabel?: string;
};

export type RadioProps = {
  isSelected?: boolean;
  onSelect?: () => void;
  isDisabled?: boolean;
  children?: ReactNode;
  accessibilityLabel?: string;
};

function Checkbox({
  isSelected = false,
  onChange,
  isDisabled = false,
  children,
  accessibilityLabel,
}: CheckboxProps) {
  const hasChildren = children != null;
  const { styles, iconRef, checkSize } = useStyles({
    variant: 'checkbox',
    selected: isSelected,
    disabled: isDisabled,
  });

  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => onChange?.(!isSelected)}
      style={hasChildren ? styles.row : styles.control}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      accessibilityLabel={accessibilityLabel}
    >
      {hasChildren ? children : null}
      <View style={styles.circle}>
        {isSelected ? (
          <AmityIcon name="check-1-s" size={checkSize} tokenColor={iconRef} />
        ) : null}
      </View>
    </Pressable>
  );
}

function Radio({
  isSelected = false,
  onSelect,
  isDisabled = false,
  children,
  accessibilityLabel,
}: RadioProps) {
  const hasChildren = children != null;
  const { styles } = useStyles({
    variant: 'radio',
    selected: isSelected,
    disabled: isDisabled,
  });

  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => onSelect?.()}
      style={hasChildren ? styles.row : styles.control}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      accessibilityLabel={accessibilityLabel}
    >
      {hasChildren ? children : null}
      <View style={styles.circle}>
        {isSelected ? <View style={styles.dot} /> : null}
      </View>
    </Pressable>
  );
}

export const Selection = {
  Checkbox,
  Radio,
};
