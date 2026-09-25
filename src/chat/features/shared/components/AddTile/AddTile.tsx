// AddTile — ported from AmityUiKitWeb features/shared/components/AddTile.
// A small "add" tile: an icon-only plus button above a single-line caption label.
// The plus button is web's Button.Icon filled/secondary/40 — a light grey circle
// with a dark grey glyph, as in the design. (An earlier RN build rendered it
// borderless; QA flagged that as off-design.) `onClick`→`onPress`.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Button } from '../../../../../core/design/atoms/Button';
import { Typography } from '../../../../../core/design/components/Typography';
import { useStyles } from './styles';

// 3. Types
type AddTileProps = {
  onPress: () => void;
  label?: string;
  accessibilityLabel?: string;
};

// 4. Named function component
export function AddTile({ onPress, label, accessibilityLabel }: AddTileProps) {
  const { styles } = useStyles();

  return (
    <View style={styles.tile}>
      <Button.Icon
        icon="plus-r"
        styleType="filled"
        hierarchy="secondary"
        size={40}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
      />
      {label ? (
        <Typography variant="caption" style={styles.name} numberOfLines={1}>
          {label}
        </Typography>
      ) : null}
    </View>
  );
}
