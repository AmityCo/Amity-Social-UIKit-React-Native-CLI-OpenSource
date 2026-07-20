// Styles for MediaViewer — ported from AmityUiKitWeb MediaViewer.module.css.
// Geometry: bars padding 1rem→16; close button 2rem→32; bottom icon button 2.5rem→40;
// icons 1.5rem→24; radius 9999→9999. Web's opaque black backdrop has no RN token
// (the token set ships no opaque-black); substituted with the darkest available scrim
// token (SurfaceBadgeSemanticBadgeGeneralDuration, 60% black) — reported as a gap.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: token(
        AmityColorToken.SurfaceBadgeSemanticBadgeGeneralDuration
      ),
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
      backgroundColor: token(
        AmityColorToken.SurfaceBadgeSemanticBadgePostStatusTotalMedia
      ),
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
      backgroundColor: token(
        AmityColorToken.SurfaceBadgeSemanticBadgePostStatusTotalMedia
      ),
      zIndex: 3,
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
