import React, { FC } from 'react';
import { Dimensions, FlatList, Image, StyleSheet } from 'react-native';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

type ImageGalleryProps = {
  themeStyles?: MyMD3Theme;
  accessibilityId?: string;
  isLoading?: boolean;
  posts?: Amity.Post<'image'>[];
  onNextPage?: () => void;
};

const ImageGallery: FC<ImageGalleryProps> = ({
  posts,
  accessibilityId,
  isLoading,
  themeStyles,
  onNextPage,
}) => {
  const { width } = Dimensions.get('window');
  const imageWidth = (width - 32) / 2; // 16 padding on each side
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    image: {
      width: imageWidth,
      height: imageWidth,
      borderRadius: 8,
    },
  });

  return (
    <FlatList
      accessibilityLabel={accessibilityId}
      testID={accessibilityId}
      data={posts}
      scrollEnabled={false}
      keyExtractor={(item) => item.data.fileId}
      renderItem={({ item }: { item: Amity.Post<'image'> }) => {
        const uri = item.getImageInfo().fileUrl + '?size=medium';
        return (
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        );
      }}
      numColumns={2}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        onNextPage?.();
      }}
      style={styles.container}
    />
  );
};

export default ImageGallery;
