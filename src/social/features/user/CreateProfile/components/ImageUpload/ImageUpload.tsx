import {
  ActionSheetIOS,
  Alert,
  Linking,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type CameraOptions,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { camera } from '../../../../../../core/assets/icons';
import { isValidImageType } from '../../../../../utils';
import { Avatar } from '../../../../../components';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { useCameraPermission } from '../../../../../hooks';
import type { LocalImage } from '../../hooks/useCreateProfile';

// Downscale the avatar at pick time. A full-resolution photo (often 5-15MB from
// the simulator/camera roll) makes the post-login upload take many seconds; the
// avatar is only ever shown small, so cap it to 1024px and lightly compress.
// This cuts the upload to well under a second. Shared by the camera and library
// flows so both produce a small file.
const PICKER_OPTIONS: ImageLibraryOptions & CameraOptions = {
  mediaType: 'photo',
  includeBase64: false,
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
};

type ImageUploadProps = {
  value?: LocalImage | null;
  onChange: (image: LocalImage | null) => void;
  disabled?: boolean;
  /**
   * Optional remote avatar URL shown when the user hasn't picked a local photo.
   * A locally picked image (`value`) takes priority.
   */
  defaultImageUrl?: string;
};

// Pick-only: a visitor session is read-only, so the avatar can't be uploaded
// here. We hold the local image uri and the page uploads it after Client.login.
export function ImageUpload({
  value,
  onChange,
  disabled,
  defaultImageUrl,
}: ImageUploadProps) {
  const { styles, theme } = useStyles();
  const { getCameraPermission } = useCameraPermission();

  const hasImage = Boolean(value?.uri ?? defaultImageUrl);

  // Validate the picked asset and hand the local uri up. The page uploads it
  // after Client.login (a visitor session can't write).
  const handleAsset = (asset?: Asset) => {
    if (!isValidImageType(asset?.type)) {
      Alert.alert(
        'Unsupported image type',
        'Please upload a PNG or JPG image.',
        [{ text: 'OK' }]
      );
      return;
    }
    if (asset?.uri) {
      onChange({ uri: asset.uri });
    }
  };

  const openLibrary = async () => {
    const result = await launchImageLibrary({
      ...PICKER_OPTIONS,
      selectionLimit: 1,
    });
    if (result.didCancel || !result.assets?.length) return;
    handleAsset(result.assets[0]);
  };

  const openCamera = async () => {
    const granted = await getCameraPermission();
    // Permission denied — send the user to Settings to enable it (matches the
    // app's other camera flows, e.g. useImagePicker).
    if (!granted) {
      Linking.openSettings();
      return;
    }
    const result = await launchCamera({
      ...PICKER_OPTIONS,
      saveToPhotos: false,
    });
    if (result.didCancel || !result.assets?.length) return;
    handleAsset(result.assets[0]);
  };

  // Let the user choose between the camera and the photo library using the
  // native action sheet. iOS has a real action sheet (ActionSheetIOS); Android
  // has no system equivalent, so fall back to a native Alert with the same
  // options.
  const onPickImage = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Take photo', 'Upload photo', 'Cancel'],
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) openCamera();
          else if (buttonIndex === 1) openLibrary();
        }
      );
      return;
    }

    Alert.alert('Profile photo', undefined, [
      { text: 'Take photo', onPress: openCamera },
      { text: 'Upload photo', onPress: openLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <TouchableOpacity
        hitSlop={0.8}
        activeOpacity={0.7}
        disabled={disabled}
        style={styles.imageContainer}
        onPress={onPickImage}
      >
        <Avatar.User
          uri={value?.uri ?? defaultImageUrl}
          viewable={false}
          userId=""
          imageStyle={styles.image}
          shouldRedirectToUserProfile={false}
        />
        {!hasImage && (
          <View style={styles.iconContainer}>
            <SvgXml
              width={24}
              height={24}
              xml={camera()}
              color={theme.colors.white}
            />
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        onPress={onPickImage}
      >
        <Typography.BodyBold style={styles.choosePhotoLabel}>
          {hasImage ? 'Change a photo' : 'Choose a photo'}
        </Typography.BodyBold>
      </TouchableOpacity>
    </View>
  );
}
