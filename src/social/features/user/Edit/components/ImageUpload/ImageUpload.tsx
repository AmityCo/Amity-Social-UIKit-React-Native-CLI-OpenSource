import { TouchableOpacity, View } from 'react-native';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { camera } from '../../../../../../core/assets/icons';
import { getFileUrlWithSize } from '../../../../../utils';
import { Avatar } from '../../../../../components';
import useImagePicker from '../../../../../hooks/useImagePicker';
import { CircularProgressIndicator } from '../../../../../components/CircularProgressIndicator';

type ImageUploadProps = {
  user?: Amity.User;
  value?: Amity.File<'image'> | null;
  onChange: (file: Amity.File<'image'> | null) => void;
};

export function ImageUpload({ user, value, onChange }: ImageUploadProps) {
  const { styles, theme } = useStyles();
  const { openImageGallery, progress } = useImagePicker();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        hitSlop={0.8}
        activeOpacity={0.7}
        style={styles.imageContainer}
        disabled={progress > 0}
        onPress={() => {
          openImageGallery({
            mediaType: 'photo',
            selectionLimit: 1,
            includeBase64: false,
            quality: 1,
          }).then((file) => {
            if (file) {
              onChange(file);
            }
          });
        }}
      >
        <Avatar.User
          viewable={false}
          roles={user?.roles}
          imageStyle={styles.image}
          userId={user?.userId || ''}
          shouldRedirectToUserProfile={false}
          uri={getFileUrlWithSize(value?.fileUrl || user?.avatar?.fileUrl)}
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
