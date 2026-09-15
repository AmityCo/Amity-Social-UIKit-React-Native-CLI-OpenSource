// Divider atom — ported from AmityUiKitWeb core/design/atoms/Divider.
// Hairline separator (1px, from SoT divider geometry), variant-tinted via a line token.

import { View, Text } from 'react-native';
import { useStyles } from './styles';

export type DividerVariant = 'content' | 'post';
export type DividerOrientation = 'horizontal' | 'vertical';

export type DividerProps = {
  variant?: DividerVariant;
  orientation?: DividerOrientation;
  inset?: boolean;
  label?: string;
};

export function Divider({
  variant = 'post',
  orientation = 'horizontal',
  inset,
  label,
}: DividerProps) {
  const resolvedInset = inset ?? variant === 'content';
  const { styles } = useStyles(variant, orientation, resolvedInset);

  if (label) {
    return (
      <View style={styles.labeled} accessibilityRole="none">
        <View style={styles.line} />
        <Text style={styles.label}>{label}</Text>
        <View style={styles.line} />
      </View>
    );
  }

  return <View style={styles.divider} accessibilityRole="none" />;
}
