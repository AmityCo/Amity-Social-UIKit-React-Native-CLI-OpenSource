import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

// Geometry ported from AmityUiKitWeb SelectedMember.module.css (rem -> px, x16):
// tile width 4rem=64, column gap 0.25rem=4; avatar wrapper 2.5rem=40; name max
// width 4rem=64. Remove button pinned top-right; sized to the 16px cross glyph
// on a transparent-black circle (web Button.Icon transparent/primary).
export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      flexShrink: 0,
      alignItems: 'center',
      gap: 4,
      width: 64,
    },
    avatarWrapper: {
      position: 'relative',
      width: 40,
      height: 40,
    },
    removeButton: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonTransparentPrimaryEnabled
      ),
    },
    name: {
      maxWidth: 64,
      textAlign: 'center',
      color: token(AmityColorToken.TextAvatarLabelDefault),
    },
  });

  return { styles, token };
};
