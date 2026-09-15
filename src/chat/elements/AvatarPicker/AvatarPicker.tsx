// AvatarPicker element — ported from AmityUiKitWeb chat/elements/AvatarPicker.
// A tappable rounded-square tile that previews the chosen group avatar (or a
// comments-alt placeholder) with a camera overlay.
//
// RN adaptations from web:
//   - The web upload flow (FileTrigger / drawer / useImageUpload / SDK File) is
//     NOT rebuilt here. Per spec this element is presentational: it surfaces the
//     current image + a "change" affordance and delegates the actual pick to the
//     caller via `onPick`. Web `{ value, onChange }` -> `{ imageUrl, onPick }`.
//   - Web `<img>` -> RN `<Image>`; web `Loader.Spinner` -> RN `ActivityIndicator`.

// 1. React / RN imports
import { Image, Pressable, View, ActivityIndicator } from 'react-native';

// 2. Internal imports (relative)
import { AmityIcon } from '../../../core/design/icons';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';
import { useStyles } from './styles';

// 3. Types
export type AvatarPickerProps = {
  /** Resolved current avatar image URL (replaces the web SDK File `value`). */
  imageUrl?: string;
  /** Invoked when the tile is tapped — the caller launches the image picker. */
  onPick: () => void;
  /** Show a spinner overlay while an upload is in flight (web's spinner state). */
  isUploading?: boolean;
};

// 4. Named function component
export function AvatarPicker({
  imageUrl,
  onPick,
  isUploading = false,
}: AvatarPickerProps) {
  const { styles, token } = useStyles();

  return (
    <Pressable
      style={styles.picker}
      onPress={onPick}
      disabled={isUploading}
      accessibilityRole="button"
      accessibilityLabel="Upload group avatar"
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <AmityIcon
            name="comments-alt-s"
            size={48}
            tokenColor={AmityColorToken.IconAvatarDefault}
          />
        </View>
      )}
      <View style={styles.overlay}>
        {isUploading ? (
          <ActivityIndicator
            size="small"
            color={token(AmityColorToken.IconAvatarDefault)}
          />
        ) : (
          <AmityIcon
            name="camera-r"
            size={48}
            tokenColor={AmityColorToken.IconAvatarDefault}
          />
        )}
      </View>
    </Pressable>
  );
}
