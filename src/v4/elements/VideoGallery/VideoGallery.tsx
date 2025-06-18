import React, { FC, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

import { formatDuration } from '../../../util/timeUtil';
import { Typography } from '../../component/Typography/Typography';
import VideoPlayer from 'react-native-video-controls';
import ImageFeedSkeleton from '../../component/ImageFeedSkeleton/ImageFeedSkeleton';

type VideoGalleryProps = {
  themeStyles?: MyMD3Theme;
  accessibilityId?: string;
  isLoading?: boolean;
  posts?: Amity.Post<'video'>[];
  onNextPage?: () => void;
};

const VideoGallery: FC<VideoGalleryProps> = ({
  posts,
  accessibilityId,
  isLoading,
  themeStyles,
  onNextPage,
}) => {
  const { width } = Dimensions.get('window');
  const [openVideoViewer, setOpenVideoViewer] = useState(false);
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
    duration: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    durationText: {
      color: 'white',
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
          const uri = item.getVideoThumbnailInfo().fileUrl + '?size=medium';
          const videoInfo = item.getVideoInfo() as Amity.File<'video'>;
          const duration = formatDuration(
            (videoInfo?.attributes?.metadata?.video as Amity.VideoMetadata)
              ?.duration as number
          );

          return (
            <Pressable
              onPress={() => {
                setCurrentImageIndex(index);
                setOpenVideoViewer(true);
              }}
            >
              <Image source={{ uri }} style={styles.image} resizeMode="cover" />
              <View style={styles.duration}>
                <Typography.Caption style={styles.durationText}>
                  {duration}
                </Typography.Caption>
              </View>
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
        ListEmptyComponent={
          isLoading ? <ImageFeedSkeleton themeStyles={themeStyles} /> : null
        }
        style={styles.container}
      />
      {openVideoViewer && (
        <Modal
          visible={openVideoViewer}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setOpenVideoViewer(false)}
        >
          <VideoPlayer
            onBack={() => setOpenVideoViewer(false)}
            fullscreen={true}
            playWhenInactive={false}
            playInBackground={false}
            source={{
              uri: posts[currentImageIndex].getVideoInfo().fileUrl,
            }}
            fullscreenOrientation="all"
          />
        </Modal>
      )}
    </>
  );
};

export default VideoGallery;
