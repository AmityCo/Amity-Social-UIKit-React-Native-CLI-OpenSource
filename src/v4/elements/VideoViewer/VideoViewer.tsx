import React, { FC, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Typography } from '../../component/Typography/Typography';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { SvgXml } from 'react-native-svg';
import { cross } from '../../assets/icons';

type VideoViewerProps = {
  currentImageIndex: number;
  images: string[];
  themeStyles?: MyMD3Theme;
  onNextImage: () => void;
  onPreviousImage: () => void;
  onClose?: () => void;
};

const VideoViewer: FC<VideoViewerProps> = ({
  themeStyles,
  currentImageIndex,
  images,
  onNextImage,
  onPreviousImage,
  onClose = () => {},
}) => {
  const [active, setActive] = useState(currentImageIndex);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    if (scrollViewRef.current && active !== currentImageIndex) {
      scrollViewRef.current.scrollTo({
        x: width * currentImageIndex,
        animated: true,
      });
      setActive(currentImageIndex);
    }
  }, [currentImageIndex, width, active]);

  const styles = StyleSheet.create({
    container: {
      position: 'absolute', // Make sure container fills the screen
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000000',
    },
    scrollViewContainer: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    button: {
      position: 'absolute',
      top: 40,
      left: 16,
      height: 24,
      width: 24,
      backgroundColor: themeStyles?.colors?.baseShade4,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      // TODO: check if this is needed, because it has conflict with header component
      zIndex: 1001,
    },
    indicatorText: {
      color: 'white',
    },
    image: {
      width: width - 40,
      height: height - 200,
      resizeMode: 'contain',
    },
    imageContainer: {
      width: width,
      height: height,
      justifyContent: 'center',
      alignItems: 'center',
    },
    counterContainer: {
      position: 'absolute',
      top: 40,
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingVertical: 5,
      paddingHorizontal: 15,
      borderRadius: 20,
    },
  });

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);

    if (newIndex !== active) {
      setActive(newIndex);
      if (newIndex > active) {
        onNextImage();
      } else {
        onPreviousImage();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={onClose}>
        <SvgXml xml={cross()} />
      </Pressable>
      <View style={styles.scrollViewContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          // contentContainerStyle={styles.scrollView}
          scrollEventThrottle={16}
          decelerationRate="fast"
        >
          {images.map((imageUrl, index) => (
            <View key={`image-${index}`} style={styles.imageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Counter indicator */}
      <View style={styles.counterContainer}>
        <Typography.Title style={styles.indicatorText}>
          {`${active + 1}/${images.length}`}
        </Typography.Title>
      </View>
    </View>
  );
};

export default VideoViewer;
