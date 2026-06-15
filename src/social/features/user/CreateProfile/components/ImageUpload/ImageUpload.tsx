import { Alert, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { camera } from '../../../../../../core/assets/icons';
import { isValidImageType } from '../../../../../utils';
import { Avatar } from '../../../../../components';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import type { LocalImage } from '../../hooks/useCreateProfile';

type ImageUploadProps = {
  value?: LocalImage | null;
  onChange: (image: LocalImage | null) => void;
  disabled?: boolean;
};

// Pick-only: a visitor session is read-only, so the avatar can't be uploaded
// here. We hold the local image uri and the page uploads it after Client.login.
export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const { styles, theme } = useStyles();

  const onPickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      includeBase64: false,
      quality: 1,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
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
          uri={value?.uri}
          viewable={false}
          userId=""
          imageStyle={styles.image}
          shouldRedirectToUserProfile={false}
        />
        <View style={styles.iconContainer}>
          <SvgXml
            width={24}
            height={24}
            xml={camera()}
            color={theme.colors.white}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        onPress={onPickImage}
      >
        <Typography.BodyBold style={styles.choosePhotoLabel}>
          Choose a photo
        </Typography.BodyBold>
      </TouchableOpacity>
    </View>
  );
}
