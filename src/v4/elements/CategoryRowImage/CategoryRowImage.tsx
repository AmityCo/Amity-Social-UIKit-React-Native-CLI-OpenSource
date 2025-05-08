import React, { FC, memo, useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useAmityElement, useFile } from '../../hook';
import { PageID, ComponentID, ElementID } from '../../enum';
import { SvgXml } from 'react-native-svg';
import { category as categoryIcon } from '../../assets/icons';

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
  const { getImage } = useFile();
  const { themeStyles, isExcluded } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  const [imageUri, setImageUri] = React.useState<string | null>(null);

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

  useEffect(() => {
    if (!avatarFileId) return;

    const fetchImage = async () => {
      const image = await getImage({ fileId: avatarFileId });
      if (image) {
        setImageUri(image);
      }
    };

    fetchImage();
  }, [avatarFileId, getImage]);

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
          <SvgXml xml={categoryIcon()} />
        </View>
      )}
    </View>
  );
};
export default memo(CategoryRowImage);
