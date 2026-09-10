import { StyleSheet } from 'react-native';
import { useToken, type ColorTokenRef } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';
import type { AvatarShape, AvatarSize, AvatarState } from './Avatar';

// Frame box per intrinsic size — SoT geometry.json avatarIcon.avatar.sizes
// = [16, 24, 28, 32, 40, 56, 64, 120]. Literal width/height so the geometry
// gate can assert `width` is one of the SoT sizes.
const FRAME: Record<AvatarSize, { width: number; height: number }> = {
  16: { width: 16, height: 16 },
  24: { width: 24, height: 24 },
  28: { width: 28, height: 28 },
  32: { width: 32, height: 32 },
  40: { width: 40, height: 40 },
  56: { width: 56, height: 56 },
  64: { width: 64, height: 64 },
  120: { width: 120, height: 120 },
};

// Squared corner radius per size bucket (web Avatar.module.css).
const SQUARED_RADIUS: Record<AvatarSize, number> = {
  16: 4,
  24: 4,
  28: 4,
  32: 4,
  40: 8,
  56: 16,
  64: 16,
  120: 24,
};

// Fallback user-icon glyph size per avatar size (web Avatar.module.css).
const GLYPH_SIZE: Record<AvatarSize, number> = {
  16: 12,
  24: 16,
  28: 18,
  32: 20,
  40: 24,
  56: 32,
  64: 32,
  120: 64,
};

// Initials font size per avatar size (web Avatar.module.css).
const INITIALS_SIZE: Record<AvatarSize, number> = {
  16: 10,
  24: 10,
  28: 10,
  32: 16,
  40: 16,
  56: 24,
  64: 24,
  120: 48,
};

export const useStyles = (
  size: AvatarSize,
  shape: AvatarShape,
  state: AvatarState,
  borderWidth: number
) => {
  const token = useToken();
  const frame = FRAME[size];
  const borderRadius = shape === 'rounded' ? size / 2 : SQUARED_RADIUS[size];
  const backgroundColor =
    state === 'skeleton'
      ? token(AmityColorToken.SurfaceSkeletonEffectDefault)
      : token(AmityColorToken.SurfaceAvatarProfileDefault);

  const styles = StyleSheet.create({
    container: { alignItems: 'center', gap: 4 },
    frameWrapper: { position: 'relative', alignSelf: 'flex-start' },
    frame: {
      width: frame.width,
      height: frame.height,
      borderRadius,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor,
      borderWidth,
      borderColor: token(AmityColorToken.BorderAvatarProfileDefault),
    },
    image: { width: '100%', height: '100%' },
    initials: {
      fontSize: INITIALS_SIZE[size],
      fontWeight: '600',
      textTransform: 'uppercase',
      color: token(AmityColorToken.TextAvatarAtomicGeneral),
    },
    indicator: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      borderRadius: 9999,
      borderWidth: 3,
      borderColor: token(AmityColorToken.BorderAvatarIndicatorDefault),
    },
    label: {
      fontSize: 13,
      textAlign: 'center',
      color: token(AmityColorToken.TextAvatarLabelDefault),
    },
  });

  const glyphColor: ColorTokenRef = AmityColorToken.IconAvatarDefault;

  return { styles, glyphSize: GLYPH_SIZE[size], glyphColor };
};
