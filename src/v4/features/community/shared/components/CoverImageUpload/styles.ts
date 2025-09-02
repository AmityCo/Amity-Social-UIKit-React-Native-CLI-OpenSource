import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      aspectRatio: 2 / 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryShade3,
    },
    defaultImage: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.primaryShade3,
    },
    uploadedImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    imageOverlay: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    button: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return {
    theme,
    styles,
  };
};
