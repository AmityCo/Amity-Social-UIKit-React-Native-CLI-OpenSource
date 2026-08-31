// Styles for NewMessageNotification — ported from NewMessageNotification.module.css.
// Geometry: pinned left/right 1rem→16, bottom 0.5rem→8, height 2.5rem→40,
// padding 0.375rem/0.625rem→ top/bottom 6, left 6, right 10; radius 0.5rem→8;
// gaps 0.5rem/0.625rem→8/10; thumb 1.75rem→28, radius 0.25rem→4; arrow 0.625rem→10
// rotated 180°. box-shadow dropped (RN, no hex allowed). Colours via tokens.

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
      paddingTop: 6,
      paddingBottom: 6,
      paddingLeft: 6,
      paddingRight: 10,
      borderRadius: 8,
      backgroundColor: token(AmityColorToken.SurfaceCustomToastDefaultDefault),
    },
    left: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    preview: {
      flexShrink: 1,
      color: token(AmityColorToken.TextCustomToastDefault),
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
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
    arrow: {
      transform: [{ rotate: '180deg' }],
    },
  });

  return { styles, token };
};
