// Styles for MediaUploadOverlay — ported from AmityUiKitWeb MediaUploadOverlay.module.css.
// Absolute inset:0 scrim centered over its parent, using the same token web's
// .overlay does (--asc-color-surface-media-overlay-transparentblack). PDT-5235: this
// previously borrowed SurfaceBadgeSemanticBadgePostStatusTotalMedia, which happens to
// carry the same 50% black today but is a post-status badge token — it would drift
// from web under a custom theme.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token(
        AmityColorToken.SurfaceMediaOverlayTransparentBlack
      ),
    },
  });

  return { styles, token };
};
