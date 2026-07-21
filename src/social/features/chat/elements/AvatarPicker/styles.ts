import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

// Geometry ported from AmityUiKitWeb AvatarPicker.module.css (rem -> px, x16):
// tile 7.5rem=120, radius 1.5rem=24; placeholder icon 3rem=48; camera icon 4rem=64.
// Overlay: web `--asc-color-background-transparent-black` (50% black) has no direct
// RN token; substituted with SurfaceBadgeSemanticBadgePostStatusTotalMedia (an exact
// 50%-black match), same precedent as MediaUploadOverlay — reported as a gap.
export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    picker: {
      position: 'relative',
      width: 120,
      height: 120,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: token(AmityColorToken.SurfaceAvatarProfileDefault),
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    placeholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
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
