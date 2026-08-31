import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      height: 56,
      zIndex: 2,
    },
    headerBtn: {
      minWidth: 44,
      height: 44,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    headerBtn__right: {
      minWidth: 44,
      height: 44,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    counter: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    muteGlyph: {
      fontSize: 20,
    },
    page: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    media: {
      width: '100%',
      height: '100%',
    },
    // --- video control bar (ported from web VideoPlayerControls) ---
    controlBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingBottom: 24,
      paddingTop: 12,
      zIndex: 3,
    },
    controlTime: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 8,
    },
    progressTrack: {
      height: 24,
      justifyContent: 'center',
    },
    progressBg: {
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    progressFill: {
      position: 'absolute',
      left: 0,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#FFFFFF',
    },
    // Centered play/pause + skip row (web .mobileControlsRow: top/left 50%,
    // translate -50%, gap 2rem).
    centerControls: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Circular translucent-black button (web .playButton/.skipButton: 2.5rem,
    // border-radius 50%, transparent-black bg). 32px gap between buttons.
    centerBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 16,
    },
  });

  return { styles, theme };
};
