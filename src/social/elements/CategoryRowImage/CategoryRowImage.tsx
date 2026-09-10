import { FC, memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { FileRepository } from '@amityco/ts-sdk-react-native';
import { useAmityElement, useFile } from '../../hooks';
import { ImageSizeState } from '../../enums/imageSizeState';
import { PageID, ComponentID, ElementID } from '../../enums';
import { SvgXml } from 'react-native-svg';
import { category as categoryIcon } from '../../../core/assets/icons';

type CategoryRowImageProps = {
  avatarFileId?: string;
  pageId?: PageID;
  componentId?: ComponentID;
};

const CategoryRowImage: FC<CategoryRowImageProps> = ({
  avatarFileId,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
}) => {
  const elementId = ElementID.category_row_image;
  const { themeStyles, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  // A category is not an avatar: resolve the file itself, so a file that does
  // not resolve leaves imageUri null and the category glyph below shows. The
  // avatar hook would have answered with a picture of a person instead.
  const avatarFile = useFile<'image'>(avatarFileId);
  const imageUri = avatarFile?.fileUrl
    ? FileRepository.fileUrlWithSize(avatarFile.fileUrl, ImageSizeState.small)
    : null;

  const styles = StyleSheet.create({
    contianer: {
      color: themeStyles?.colors.base,
      height: 40,
      width: 40,
      borderRadius: 40,
    },
    placeholder: {
      width: '100%',
      height: '100%',
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      // TODO: fix color
      backgroundColor: themeStyles.colors.primaryShade2,
    },
    image: {
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    },
  });

  if (isExcluded) return null;

  return (
    <View style={styles.contianer}>
      {avatarFileId && imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <SvgXml
            xml={categoryIcon()}
            color={themeStyles?.colors.primaryShade2}
          />
        </View>
      )}
    </View>
  );
};
export default memo(CategoryRowImage);
