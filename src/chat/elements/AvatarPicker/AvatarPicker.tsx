// AvatarPicker element — ported from AmityUiKitWeb chat/elements/AvatarPicker.
// A tappable rounded-square tile that previews the chosen group avatar (or a
// comments-alt placeholder) with a camera overlay.
//
// RN adaptations from web:
//   - The web upload flow (FileTrigger / useImageUpload / SDK File) is NOT
//     rebuilt here. This element surfaces the current image + a "change"
//     affordance and delegates the actual pick + upload to the caller via
//     `onPick`. Web `{ value, onChange }` -> `{ imageUrl, onPick }`.
//   - Web `<img>` -> RN `<Image>`; web `Loader.Spinner` -> RN `ActivityIndicator`.
//   - Source sheet (PDT-5061): web's mobile branch opens a drawer holding a
//     CameraButton + ImageButton before any file is chosen. RN mirrors that with
//     the bottom sheet + Menu used by AmityMediaAttachmentPicker, then reports
//     the chosen source to `onPick`. Tapping the tile must never jump straight
//     into the gallery — that was the bug.

// 1. React / RN imports
import { Image, Pressable, View, ActivityIndicator } from 'react-native';

// 2. Internal imports (relative)
import { Menu } from '../../../core/design/components/Menu';
import { AmityIcon } from '../../../core/design/icons';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../core/localization';
import { useBottomSheet } from '../../../core/stores/slices/bottomSheetSlice';
import { useStyles } from './styles';

// 3. Types
/** Which picker the user chose in the source sheet (web: CameraButton / ImageButton). */
export type AvatarPickerSource = 'camera' | 'photo';

export type AvatarPickerProps = {
  /** Resolved current avatar image URL (replaces the web SDK File `value`). */
  imageUrl?: string;
  /** Invoked with the chosen source — the caller launches that picker. */
  onPick: (source: AvatarPickerSource) => void;
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
  const { openBottomSheet, closeBottomSheet, bottomSheetHeight } =
    useBottomSheet();

  // Same two strings web's drawer uses for these rows.
  const cameraLabel = useString('amity_chat_media_camera');
  const photoLabel = useString('amity_chat_media_photo');

  function handleSelect(source: AvatarPickerSource) {
    closeBottomSheet();
    onPick(source);
  }

  function handlePress() {
    openBottomSheet({
      height: bottomSheetHeight[2 as keyof typeof bottomSheetHeight],
      content: (
        <View style={styles.sourceSheet}>
          <Menu variant="chat" container="drawer">
            <Menu.Item
              icon="camera-r"
              label={cameraLabel}
              onPress={() => handleSelect('camera')}
            />
            <Menu.Item
              icon="image-r"
              label={photoLabel}
              onPress={() => handleSelect('photo')}
            />
          </Menu>
        </View>
      ),
    });
  }

  return (
    <Pressable
      style={styles.picker}
      onPress={handlePress}
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
