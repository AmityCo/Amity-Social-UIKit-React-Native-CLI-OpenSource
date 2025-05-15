import React, { FC, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import ImageViewer from '../ImageViewer/ImageViewer';

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
  // isLoading,
  themeStyles,
  onNextPage,
}) => {
  const { width } = Dimensions.get('window');
  const [openImageViewer, setOpenImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageWidth = (width - 32 - 8) / 2;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    contentContainer: {
      gap: 8,
    },
    columnWrapper: {
      justifyContent: 'space-between',
    },
    image: {
      width: imageWidth,
      height: imageWidth,
      borderRadius: 8,
    },
  });

  return (
    <>
      <FlatList
        accessibilityLabel={accessibilityId}
        testID={accessibilityId}
        data={posts}
        scrollEnabled={false}
        keyExtractor={(item) => item.data.fileId}
        renderItem={({
          item,
          index,
        }: {
          item: Amity.Post<'image'>;
          index: number;
        }) => {
          const uri = item.getImageInfo().fileUrl + '?size=medium';
          return (
            <Pressable
              onPress={() => {
                setCurrentImageIndex(index);
                setOpenImageViewer(true);
              }}
            >
              <Image source={{ uri }} style={styles.image} resizeMode="cover" />
            </Pressable>
          );
        }}
        numColumns={2}
        onEndReachedThreshold={0.5}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
        onEndReached={() => {
          onNextPage?.();
        }}
        style={styles.container}
      />
      {openImageViewer && (
        <Modal
          visible={openImageViewer}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setOpenImageViewer(false)}
        >
          <ImageViewer
            images={
              posts?.map(
                (item) => item.getImageInfo().fileUrl + '?size=medium'
              ) || []
            }
            currentImageIndex={currentImageIndex}
            themeStyles={themeStyles}
            onNextImage={() => {
              if (currentImageIndex < (posts?.length || 0) - 1) {
                setCurrentImageIndex(currentImageIndex + 1);
              }
            }}
            onPreviousImage={() => {
              if (currentImageIndex > 0) {
                setCurrentImageIndex(currentImageIndex - 1);
              }
            }}
            onClose={() => {
              setOpenImageViewer(false);
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default ImageGallery;
