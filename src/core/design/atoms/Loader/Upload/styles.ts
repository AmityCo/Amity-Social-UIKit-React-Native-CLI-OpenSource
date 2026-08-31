import { StyleSheet } from 'react-native';
import { useToken } from '../../../theme/useToken';
import { AmityColorToken } from '../../../tokens/amity-color-tokens';
import type { UploadSize } from './Upload';

// Ring geometry mirrors the web SVG: viewBox 0 0 40 40, r=18, stroke-width 2.
// react-native-svg ignores pathLength, so the arc dash is computed against the
// real circumference (2πr) instead of the web's normalized 100.
export const RING_RADIUS = 18;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 113.097
export const RING_STROKE_WIDTH = 2;
export const TRACK_OPACITY = 0.5;

// Geometry (SoT: Upload.module.css, rem × 16): container medium 2.5rem → 40,
// large 4.5rem → 72; cancel icon medium 1.5rem → 24, large 2rem → 32.
const CONTAINER: Record<UploadSize, number> = {
  medium: 40,
  large: 72,
};
const CANCEL_ICON: Record<UploadSize, number> = {
  medium: 24,
  large: 32,
};

export const useStyles = (size: UploadSize) => {
  const token = useToken();
  const dimension = CONTAINER[size];

  const styles = StyleSheet.create({
    container: {
      width: dimension,
      height: dimension,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ring: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countdown: {
      fontSize: 32,
      fontWeight: '700',
      color: token(AmityColorToken.TextLoadersUploadControllerDefault),
    },
  });

  return {
    styles,
    token,
    dimension,
    trackColor: token(AmityColorToken.SurfaceLoadersUploadControllerBackground),
    arcColor: token(AmityColorToken.SurfaceLoadersUploadControllerLoader),
    cancelIconSize: CANCEL_ICON[size],
    cancelIconColor: AmityColorToken.IconLoadersUploadControllerDefault,
  };
};
