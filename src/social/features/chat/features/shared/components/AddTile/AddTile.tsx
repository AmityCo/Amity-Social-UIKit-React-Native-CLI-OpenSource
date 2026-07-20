// AddTile — ported from AmityUiKitWeb features/shared/components/AddTile.
// A small "add media" tile: a circular filled-secondary icon button above a
// single-line caption label. Web renders Button.Icon (filled/secondary/40px);
// RN has no matching icon-button atom, so a themed Pressable carries the plus
// glyph. `onClick`→`onPress`.

// 1. React / RN imports
import { Pressable, View } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
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
      <Pressable
        style={styles.button}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <AmityIcon
          name="plus-r"
          size={24}
          tokenColor={AmityColorToken.IconIconButtonFilledSecondaryDefault}
        />
      </Pressable>
      {label ? (
        <Typography variant="caption" style={styles.name} numberOfLines={1}>
          {label}
        </Typography>
      ) : null}
    </View>
  );
}
