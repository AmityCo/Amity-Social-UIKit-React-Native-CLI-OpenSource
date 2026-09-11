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
      position: 'relative',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    failedOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      borderRadius: 5,
    },
    errorOverlay: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
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
      // Matched to the web UIKit's remove button, which is 20px of icon inside
      // 4px of padding at an 8px offset. The old 12/7 pair came to nearly the
      // same 26dp outer size but filled only 46% of the circle with the glyph
      // against web's 71%, so it read as a heavy black disc with a tiny cross
      // in it.
      top: 8,
      right: 8,
      padding: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      borderRadius: 72,
      zIndex: 10,
    },
  });
};
