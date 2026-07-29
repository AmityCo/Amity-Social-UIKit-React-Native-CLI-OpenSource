// AmityMediaAttachmentPicker — ported from AmityUiKitWeb MessageComposer/components/MediaSection.
// Two entry points for attaching a photo/video to a message: Camera (launchCamera) and
// Media library (launchImageLibrary). Web used a hidden <input capture> + FileTrigger and
// returned a File; RN uses react-native-image-picker and hands the selected Asset back to
// the caller via onPickAsset.
//
// Platform deviation (Android only): the Camera entry point opens a Photo/Video bottom
// sheet first, because Android has no combined photo+video capture intent. iOS keeps the
// single-tap flow — its native camera already exposes the toggle. See MEDIA_TYPE.

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
import { Menu } from '../../../../../core/design/components/Menu';
import { Typography } from '../../../../../core/design/components/Typography';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import { useBottomSheet } from '../../../../../core/stores/slices/bottomSheetSlice';
import { useStyles } from './styles';

// 4. Types
type AmityMediaAttachmentPickerProps = {
  onPickAsset: (asset: Asset) => void;
};

// 'mixed' behaves differently per platform in react-native-image-picker:
//   - iOS: mediaTypes = [image, movie], so the native camera shows its own
//     PHOTO/VIDEO toggle — matching iOS UIKit's MessageCameraPickerView.
//   - Android: launchCamera branches `mediaType === 'video' ? VIDEO_CAPTURE :
//     IMAGE_CAPTURE`, so 'mixed' would silently mean photo-only. Android has no
//     combined capture intent, so handleCamera picks the mode up front via a
//     Photo/Video sheet and never passes 'mixed' to launchCamera.
//     (launchImageLibrary is unaffected — it handles 'mixed' on both platforms.)
const MEDIA_TYPE: MediaType = 'mixed';

// 5. Named function component
export function AmityMediaAttachmentPicker({
  onPickAsset,
}: AmityMediaAttachmentPickerProps) {
  const { styles } = useStyles();
  const { openBottomSheet, closeBottomSheet, bottomSheetHeight } =
    useBottomSheet();
  const cameraLabel = useString('amity_chat_media_camera');
  const mediaLabel = useString('amity_chat_media');
  const photoLabel = useString('amity_chat_media_photo');
  const videoLabel = useString('amity_chat_media_video');

  async function capture(mediaType: MediaType) {
    // CAMERA is declared in AndroidManifest, so react-native-image-picker
    // requires the runtime permission to be granted before launchCamera — and it
    // does NOT request it itself, so without this the camera silently never opens.
    //
    // Video additionally needs RECORD_AUDIO. launchCamera fires
    // MediaStore.ACTION_VIDEO_CAPTURE, and the camera app records on the
    // caller's behalf: because the app *declares* RECORD_AUDIO, an ungranted mic
    // makes that recording fail and the intent come back cancelled — no assets,
    // no errorCode — so the recorded video silently never reached the chat.
    // Same pairing as livestream/Create, which requests both up front.
    if (Platform.OS === 'android') {
      const required = [PermissionsAndroid.PERMISSIONS.CAMERA];
      if (mediaType === 'video') {
        required.push(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      }
      const statuses = await PermissionsAndroid.requestMultiple(required);
      const allGranted = required.every(
        (permission) =>
          statuses[permission] === PermissionsAndroid.RESULTS.GRANTED
      );
      if (!allGranted) return;
    }
    // videoQuality matches iOS UIKit's MessageCameraPickerView (`videoQuality =
    // .typeHigh`); without it react-native-image-picker falls back to medium.
    const result = await launchCamera({
      mediaType,
      videoQuality: 'high',
      saveToPhotos: false,
    });
    const asset = result.assets?.[0];
    if (asset) onPickAsset(asset);
  }

  function handleCamera() {
    // iOS: the native camera carries its own PHOTO/VIDEO toggle, so 'mixed' opens
    // exactly what iOS UIKit opens — no extra step. Android has no combined
    // capture intent (see MEDIA_TYPE), so the choice has to be made up front.
    // Documented deviation: Android shows one more sheet than iOS/web.
    if (Platform.OS !== 'android') {
      capture(MEDIA_TYPE);
      return;
    }
    openBottomSheet({
      height: bottomSheetHeight[2 as keyof typeof bottomSheetHeight],
      content: (
        <View style={styles.cameraSheet}>
          <Menu variant="chat" container="drawer">
            <Menu.Item
              label={photoLabel}
              onPress={() => {
                closeBottomSheet();
                capture('photo');
              }}
            />
            <Menu.Item
              label={videoLabel}
              onPress={() => {
                closeBottomSheet();
                capture('video');
              }}
            />
          </Menu>
        </View>
      ),
    });
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
