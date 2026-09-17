// Styles for NewMessageNotification.
// Geometry: pinned 16 left/right, 8 up from the bottom, 40 tall, padding 6/8,
// fully rounded; gaps 16 (avatar → text) and 8 (thumb → chevron); thumb 28
// square at radius 4 with a 20 play badge over a 16 glyph; chevron 28.
// The design's drop shadow is omitted — it would need a raw hex, which this repo
// does not allow outside the token set. Colours all resolve through tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    notification: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      height: 40,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: 9999,
      // The banner surface, not the toast one: Surface/CustomToast/Default/Default
      // is the same dark grey in BOTH themes, which is why the pill stayed dark
      // under a light theme. The banner token flips with the theme, and this pill
      // is a banner — it sits in the page, not over it as a transient toast.
      backgroundColor: token(AmityColorToken.SurfaceBannerSubdueGeneral),
    },
    left: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    preview: {
      flexShrink: 1,
      color: token(AmityColorToken.TextBannerSubdueHeaderGeneral),
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    },
    thumb: {
      width: 28,
      height: 28,
      borderRadius: 4,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token(AmityColorToken.SurfaceMediaImageLoaded),
    },
    thumbImg: {
      width: '100%',
      height: '100%',
    },
    playBadge: {
      position: 'absolute',
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9999,
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonTransparentPrimaryEnabled
      ),
    },
  });

  return { styles, token };
};
