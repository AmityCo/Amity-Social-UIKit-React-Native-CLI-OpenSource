// AmityMediaAttachmentPicker — ported from AmityUiKitWeb MessageComposer/components/MediaSection.
// Two entry points for attaching a photo/video to a message: Camera (launchCamera) and
// Media library (launchImageLibrary). Web used a hidden <input capture> + FileTrigger and
// returned a File; RN uses react-native-image-picker and hands the selected Asset back to
// the caller via onPickAsset.

// 1. React / RN imports
import { PermissionsAndroid, Platform, Pressable, View } from 'react-native';

// 2. Third-party imports
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type MediaType,
} from 'react-native-image-picker';

// 3. Internal imports
import { AmityIcon } from '../../../../../core/design/icons';
import { Typography } from '../../../../../core/design/components/Typography';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import { useStyles } from './styles';

// 4. Types
type AmityMediaAttachmentPickerProps = {
  onPickAsset: (asset: Asset) => void;
};

const MEDIA_TYPE: MediaType = 'mixed';

// 5. Named function component
export function AmityMediaAttachmentPicker({
  onPickAsset,
}: AmityMediaAttachmentPickerProps) {
  const { styles } = useStyles();
  const cameraLabel = useString('amity_chat_media_camera');
  const mediaLabel = useString('amity_chat_media');

  async function handleCamera() {
    // CAMERA is declared in AndroidManifest, so react-native-image-picker
    // requires the runtime permission to be granted before launchCamera — and it
    // does NOT request it itself, so without this the camera silently never opens.
    if (Platform.OS === 'android') {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (status !== PermissionsAndroid.RESULTS.GRANTED) return;
    }
    const result = await launchCamera({
      mediaType: MEDIA_TYPE,
      saveToPhotos: false,
    });
    const asset = result.assets?.[0];
    if (asset) onPickAsset(asset);
  }

  async function handleLibrary() {
    const result = await launchImageLibrary({
      mediaType: MEDIA_TYPE,
      selectionLimit: 1,
    });
    const asset = result.assets?.[0];
    if (asset) onPickAsset(asset);
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          style={styles.item}
          accessibilityRole="button"
          accessibilityLabel={cameraLabel}
          onPress={handleCamera}
        >
          {({ pressed }) => (
            <>
              <View style={[styles.chip, pressed && styles.chipPressed]}>
                <AmityIcon
                  name="camera-r"
                  size={24}
                  tokenColor={
                    AmityColorToken.IconIconButtonFilledSecondaryDefault
                  }
                />
              </View>
              <Typography
                variant="caption"
                style={styles.label}
                numberOfLines={1}
              >
                {cameraLabel}
              </Typography>
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.item}
          accessibilityRole="button"
          accessibilityLabel={mediaLabel}
          onPress={handleLibrary}
        >
          {({ pressed }) => (
            <>
              <View style={[styles.chip, pressed && styles.chipPressed]}>
                <AmityIcon
                  name="image-r"
                  size={24}
                  tokenColor={
                    AmityColorToken.IconIconButtonFilledSecondaryDefault
                  }
                />
              </View>
              <Typography
                variant="caption"
                style={styles.label}
                numberOfLines={1}
              >
                {mediaLabel}
              </Typography>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
