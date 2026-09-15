// Styles for MediaUploadOverlay — ported from AmityUiKitWeb MediaUploadOverlay.module.css.
// Absolute inset:0 scrim centered over its parent. Web's --asc-color-message-overlay
// (rgb(41 43 50 / 40%)) has no RN token; substituted with the closest media-context dark
// scrim (SurfaceBadgeSemanticBadgePostStatusTotalMedia, 50% black) — reported as a gap.

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
        AmityColorToken.SurfaceBadgeSemanticBadgePostStatusTotalMedia
      ),
    },
  });

  return { styles, token };
};
