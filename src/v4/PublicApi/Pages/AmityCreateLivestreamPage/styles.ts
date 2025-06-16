import { Dimensions, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const { height: screenHeight } = Dimensions.get('window');
  const insets = useSafeAreaInsets();

  const availableHeight = screenHeight - 80 - 60 - 40 - 40 - 120;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      position: 'relative',
    },
    cameraContainer: {
      flex: 1,
      top: 0,
      bottom: 80,
      left: 0,
      right: 0,
      position: 'absolute',
      zIndex: 10,
    },
    overlay: {
      flex: 1,
      height: '100%',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      position: 'absolute',
      zIndex: 50,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    noPermissionOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 1)',
    },
    camera: {
      flex: 1,
      height: '100%',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: insets.bottom,
      minHeight: 80,
      paddingHorizontal: 16,
      paddingVertical: 20,
      backgroundColor: '#000000',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 100,
    },
    thumbnailButton: {
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    thumbnailImageContainer: {
      width: 70,
      height: 40,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.background,
      overflow: 'hidden',
      position: 'relative',
      zIndex: 100,
    },
    thumbnailImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    thumbnailLoader: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -12 }, { translateY: -12 }],
      justifyContent: 'center',
      alignItems: 'center',
    },

    bottomSheetContainer: {
      paddingBottom: 32,
      color: theme.colors.background,
    },
    bottomSheetButton: {
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
    },
    changeThumbnail: {
      color: theme.colors.base,
    },
    deleteThumbnail: {
      color: theme.colors.alert,
    },
    content: {
      position: 'absolute',
      top: insets.top,
      left: 0,
      right: 0,
      bottom: 80 + insets.bottom,
      zIndex: 100,
      justifyContent: 'space-between',
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    },
    inputContainer: {
      gap: 8,
      paddingTop: 20,
      paddingHorizontal: 16,
    },
    titleInput: {
      fontSize: 20,
      fontWeight: '700',
      padding: 0,
      color: theme.colors.background,
    },
    descriptionInput: {
      fontSize: 15,
      padding: 0,
      color: theme.colors.background,
      textAlignVertical: 'top',
      lineHeight: 20,
      maxHeight: availableHeight,
    },
    goLiveContainer: {
      minHeight: 120,
      maxHeight: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    goLiveButtonDisabled: {
      opacity: 0.2,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    communityButton: {
      flex: 1,
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'flex-end',
      color: theme.colors.background,
    },
    connecting: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      gap: 12,
      zIndex: 100,
      alignItems: 'center',
    },
    indicator: {
      width: 40,
      height: 40,
    },
    text: {
      color: theme.colors.background,
    },
    timer: {
      position: 'absolute',
      top: 20 + insets.top,
      left: 16,
      zIndex: 100,
      backgroundColor: theme.colors.live,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    endLiveButton: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.colors.secondaryShade4,
      borderRadius: 8,
    },
    permission: {
      flex: 1,
      top: 80 + insets.top,
      left: 0,
      bottom: 0,
      right: 0,
      zIndex: 200,
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 80 + insets.top,
      backgroundColor: 'rgba(0, 0, 0, .7)',
    },
    permissionTitle: {
      color: theme.colors.background,
      textAlign: 'center',
      marginBottom: 8,
    },
    permissionDescription: {
      color: theme.colors.background,
      textAlign: 'center',
      marginBottom: 24,
    },
    reconnectingText: {
      color: theme.colors.background,
      textAlign: 'center',
    },
  });

  return styles;
};
