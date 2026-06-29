import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      gap: 8,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    choosePhotoLabel: {
      color: theme.colors.primary,
    },
    disabled: {
      opacity: 0.5,
    },
    imageContainer: {
      width: 64,
      height: 64,
      borderRadius: 100,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 100,
      objectFit: 'cover',
    },
    iconContainer: {
      inset: 0,
      zIndex: 10,
      padding: 20,
      borderRadius: 100,
      position: 'absolute',
      backgroundColor: theme.colors.transparentBlack,
    },
  });

  return { styles, theme };
};
