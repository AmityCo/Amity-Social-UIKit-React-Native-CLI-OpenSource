// Styles for MediaUploadOverlay — ported from AmityUiKitWeb MediaUploadOverlay.module.css.
// Absolute inset:0 scrim centered over its parent, on the media-overlay token.
// It previously borrowed SurfaceBadgeSemanticBadgePostStatusTotalMedia, which
// happens to carry the same 50% black today but is a post-status badge token —
// the two would drift apart under a custom theme.

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
