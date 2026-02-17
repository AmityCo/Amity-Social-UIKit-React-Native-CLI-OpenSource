import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
const CAMERA_ICON_SIZE = 30;

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // justifyContent: 'center',
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
    },
    avatarContainer: {
      alignItems: 'center',
      position: 'relative',
      marginBottom: 20,
    },
    avatar: {
      alignItems: 'center',
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    overlay: {
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    cameraIconContainer: {
      position: 'absolute',
      bottom: 0,
      right: '40%',
    },
    cameraIcon: {
      backgroundColor: '#EBECEF',
      borderRadius: CAMERA_ICON_SIZE / 2,
      padding: 5,
      margin: 5,
    },
    imageIcon: {},
    displayNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 10,
    },
    displayNameText: {
      flex: 1,
      fontWeight: '600',
      fontSize: 17,
      color: theme.colors.base,
    },
    characterCountContainer: {
      marginRight: 10,
    },
    characterCountText: {
      fontSize: 14,
      color: 'gray',
    },
    inputContainer: {
      justifyContent: 'flex-start',
      width: '100%',
      alignItems: 'flex-start',
    },
    input: {
      height: 50,
      padding: 10,
      borderBottomWidth: 1,
      borderRadius: 5,
      borderColor: '#EBECEF',
      fontSize: 16,
      color: theme.colors.base,
      width: '100%', // Now this will work
    },
  });

  return styles;
};
