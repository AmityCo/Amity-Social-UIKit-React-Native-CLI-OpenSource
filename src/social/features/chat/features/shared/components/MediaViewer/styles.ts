// Styles for MediaViewer — ported from AmityUiKitWeb MediaViewer.module.css.
// Geometry: bars padding 1rem→16; close button 2rem→32; bottom icon button 2.5rem→40;
// icons 1.5rem→24; radius 9999→9999. Backdrop and bars follow web's literals rather
// than tokens (web hardcodes them too, and the token set ships no opaque black):
// overlay rgb(0,0,0), bars rgba(0,0,0,0.5). rgb()/rgba() not hex, per the no-hex gate.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      // Web .mediaViewer__overlay: background #000 — solid, so no chat content
      // shows through. Was SurfaceBadgeSemanticBadgeGeneralDuration (#00000099,
      // 60% black), an unrelated badge token that left the backdrop translucent.
      backgroundColor: 'rgb(0, 0, 0)',
    },
    stage: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 16,
      // Web .mediaViewer__topBar/__bottomBar: rgb(0 0 0 / 50%). The previous
      // badge token (#00000080) resolved to the same 50%, but expressing it as a
      // literal matches ImageViewer (3b2e546c) and drops the unrelated token.
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 3,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      // Web .mediaViewer__topBar/__bottomBar: rgb(0 0 0 / 50%). The previous
      // badge token (#00000080) resolved to the same 50%, but expressing it as a
      // literal matches ImageViewer (3b2e546c) and drops the unrelated token.
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 3,
    },
    // Host for the chat toast mounted inside this Modal (the global <Toast /> is
    // outside it and would render beneath the native Modal layer). Sits above the
    // bottom bar (40 icon + 16*2 padding = 72) so save success/failure stays readable.
    toastLayer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 72,
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
