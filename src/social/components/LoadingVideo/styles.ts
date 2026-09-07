import { useWindowDimensions, StyleSheet } from 'react-native';

export const useStyles = () => {
  const { width } = useWindowDimensions();
  return StyleSheet.create({
    container: {
      flex: 1,
      height: width - 24,
      margin: 3,
    },
    image3XContainer: {
      width: width / 3 - 16,
      height: width / 3 - 16,
      margin: 3,
    },
    carouselContainer: {
      width: '100%',
      height: '100%',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
      borderRadius: 5,
      backgroundColor: '#bcbcbc',
    },
    overlay: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -25 }, { translateY: -25 }],
    },
    progressBar: {
      marginVertical: 10,
    },
    loadingImage: {
      opacity: 0.5,
    },
    loadedImage: {
      opacity: 1,
    },
    closeButton: {
      position: 'absolute',
      top: 7,
      right: 7,
      padding: 7,
      // Matches LoadingImage exactly: the icon is closeIcon('white') in both,
      // so the white scrim this used to carry left a white-on-white button
      // that all but disappeared over a light frame (PDT-5019).
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      borderRadius: 72,
      zIndex: 10,
    },
    playButton: {
      width: 100,
      height: 100,
      borderRadius: 50,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -25 }, { translateY: -25 }],
      zIndex: 1,
    },
  });
};
