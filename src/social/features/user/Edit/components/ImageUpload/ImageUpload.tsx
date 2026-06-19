import {
  ActionSheetIOS,
  Alert,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { camera } from '../../../../../../core/assets/icons';
import { Avatar } from '../../../../../components';
import useImagePicker from '../../../../../hooks/useImagePicker';
import { CircularProgressIndicator } from '../../../../../components/CircularProgressIndicator';
import type {
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';

// Downscale the avatar at pick time so the upload stays fast (the avatar is
// only ever shown small). Shared by the camera and library flows.
const PICKER_OPTIONS: ImageLibraryOptions & CameraOptions = {
  mediaType: 'photo',
  selectionLimit: 1,
  includeBase64: false,
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
};

type ImageUploadProps = {
  user?: Amity.User;
  value?: Amity.File<'image'> | null;
  onChange: (file: Amity.File<'image'> | null) => void;
};

export function ImageUpload({ user, value, onChange }: ImageUploadProps) {
  const { styles, theme } = useStyles();
  const { openImageGallery, openCamera, progress } = useImagePicker();

  const handlePickedFile = (file: void | Amity.File<'image'>) => {
    if (file) onChange(file);
  };

  const takePhoto = () => openCamera(PICKER_OPTIONS).then(handlePickedFile);
  const uploadPhoto = () =>
    openImageGallery(PICKER_OPTIONS).then(handlePickedFile);

  // Let the user choose between the camera and the photo library using the
  // native action sheet. iOS has a real action sheet (ActionSheetIOS); Android
  // has no system equivalent, so fall back to a native Alert with the same
  // options. The picker uploads immediately (the user is already signed in).
  const onPickImage = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Take photo', 'Upload photo', 'Cancel'],
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) takePhoto();
          else if (buttonIndex === 1) uploadPhoto();
        }
      );
      return;
    }

    Alert.alert('Profile photo', undefined, [
      { text: 'Take photo', onPress: takePhoto },
      { text: 'Upload photo', onPress: uploadPhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        hitSlop={0.8}
        activeOpacity={0.7}
        style={styles.imageContainer}
        disabled={progress > 0}
        onPress={onPickImage}
      >
        <Avatar.User
          viewable={false}
          roles={user?.roles}
          imageStyle={styles.image}
          userId={user?.userId || ''}
          shouldRedirectToUserProfile={false}
          // Pass the raw fileUrl — Avatar.User applies fileUrlWithSize itself.
          // Pre-sizing here double-applies the size param and yields a broken
          // URL, so the image fails to load.
          uri={value?.fileUrl || user?.avatar?.fileUrl}
        />
        <View style={styles.iconContainer}>
          {progress > 0 ? (
            <CircularProgressIndicator
              size={24}
              strokeWidth={2.3}
              progress={progress}
              progressColor={theme.colors.white}
              backgroundColor={theme.colors.white}
            />
          ) : (
            <SvgXml
              width={24}
              height={24}
              xml={camera()}
              color={theme.colors.white}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
