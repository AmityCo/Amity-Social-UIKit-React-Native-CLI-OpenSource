import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      marginVertical: 8,
      marginHorizontal: -16,
    },
    content: {
      width: '100%',
      aspectRatio: 16 / 9,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    info: {
      gap: 16,
      paddingVertical: 8,
    },
    streamImageCover: {
      width: '100%',
      height: '100%',
    },
    streamStatusRecorded: {
      top: 16,
      left: 16,
      zIndex: 1,
      borderRadius: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    streamStatusLive: {
      top: 16,
      left: 16,
      zIndex: 1,
      borderRadius: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      position: 'absolute',
      backgroundColor: theme.colors.live,
    },
    streamStatusText: {
      color: theme.colors.background,
    },
    streamPlayButton: {
      top: '50%',
      left: '50%',
      position: 'absolute',
      transform: [{ translateX: -30 }, { translateY: -20 }],
    },
  });
  return { styles, theme };
};
