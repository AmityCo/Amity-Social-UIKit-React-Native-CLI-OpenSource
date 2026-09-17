// Styles for ImageViewer — the header/footer chrome layered over
// react-native-image-viewing. Mirrors MediaViewer's bars (padding 1rem→16, buttons
// 32/40, radius 9999). The bars are wrapped in a SafeAreaView, which supplies the
// notch/home-indicator insets on top of this padding — they used to be hardcoded at
// 44 and 32, which are wrong on a Dynamic Island device (real top inset 59).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
      // Web MediaViewer bars: rgb(0 0 0 / 50%) (.mediaViewer__topBar/__bottomBar).
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    bottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
      // Web MediaViewer bars: rgb(0 0 0 / 50%) (.mediaViewer__topBar/__bottomBar).
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    // Host for the chat toast mounted inside react-native-image-viewing's Modal
    // (the global <Toast /> is outside it and renders beneath the native Modal
    // layer). Anchored above the bottom bar (40 icon + 16 top + 32 bottom = 88).
    toastLayer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 88,
      zIndex: 4,
    },
    closeButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
      borderRadius: 9999,
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonTransparentPrimaryEnabled
      ),
    },
    bottomIconButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      borderRadius: 9999,
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonTransparentPrimaryEnabled
      ),
    },
  });

  return { styles, token };
};
