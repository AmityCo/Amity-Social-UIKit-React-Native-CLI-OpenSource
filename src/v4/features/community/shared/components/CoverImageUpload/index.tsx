import React from 'react';
import { rgba } from 'polished';
import { PageID } from '~/v4/enum';
import { useStyles } from './styles';
import { SvgXml } from 'react-native-svg';
import { ImageButton } from '~/v4/elements';
import { getFileUrlWithSize } from '~/v4/utils';
import { imageUpload } from '~/v4/assets/icons';
import CameraButton from '~/v4/elements/CameraButton';
import LinearGradient from 'react-native-linear-gradient';
import { useBottomSheet } from '~/redux/slices/bottomSheetSlice';
import { UseImagePickerResponse } from '~/v4/hook/useImagePicker';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import { CircularProgressIndicator } from '~/v4/component/CircularProgressIndicator';

type CoverImageUploadProps = Pick<
  UseImagePickerResponse,
  'openCamera' | 'openImageGallery' | 'progress'
> & {
  value: Amity.File<'image'>;
  onChange: (file: Amity.File<'image'> | null) => void;
};

function CoverImageUpload({
  value,
  progress,
  onChange,
  openCamera,
  openImageGallery,
}: CoverImageUploadProps) {
  const { styles, theme } = useStyles();
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  const onImageFromCamera = async () => {
    closeBottomSheet();
    const file = await openCamera({
      mediaType: 'photo',
      quality: 1,
      includeExtra: true,
      saveToPhotos: false,
      presentationStyle: 'overFullScreen',
    });
    onChange(file || null);
  };

  const onImageUpload = async () => {
    closeBottomSheet();
    const file = await openImageGallery({
      quality: 1,
      mediaType: 'photo',
      selectionLimit: 1,
      includeExtra: true,
    });
    onChange(file || null);
  };

  return (
    <View style={styles.container}>
      {value ? (
        <Image
          style={styles.uploadedImage}
          source={{ uri: getFileUrlWithSize(value.fileUrl) }}
        />
      ) : (
        <View style={styles.defaultImage} />
      )}
      <LinearGradient
        locations={[1, 1]}
        style={styles.imageOverlay}
        colors={
          value
            ? ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.5)']
            : ['rgba(0,0,0,0.5)', theme.colors.primaryShade3]
        }
      />
      {progress > 0 ? (
        <View style={styles.button}>
          <CircularProgressIndicator
            size={24}
            strokeWidth={2.3}
            progress={progress}
            progressColor={theme.colors.primary}
            backgroundColor={theme.colors.background}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            openBottomSheet({
              content: (
                <View>
                  <CameraButton
                    onPress={onImageFromCamera}
                    pageId={PageID.community_setup_page}
                  />
                  <ImageButton
                    onPress={onImageUpload}
                    pageId={PageID.community_setup_page}
                  />
                </View>
              ),
            })
          }
        >
          <SvgXml
            width={32}
            height={32}
            xml={imageUpload()}
            color={rgba(
              theme.colors.background,
              Platform.OS === 'android' ? 1 : 0.8
            )}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default CoverImageUpload;
