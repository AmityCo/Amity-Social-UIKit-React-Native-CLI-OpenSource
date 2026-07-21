import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

// Geometry ported from AmityUiKitWeb SelectedMember.module.css (rem -> px, x16):
// tile width 4rem=64, column gap 0.25rem=4; avatar wrapper 2.5rem=40; name max
// width 4rem=64. Remove button pinned top-right — its 16px container + transparent
// surface come from the Button.Icon atom (transparent/primary/16); this style is
// positioning only (web .selectedMember__removeButton: absolute, top 0, right 0).
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
    },
    name: {
      maxWidth: 64,
      textAlign: 'center',
      color: token(AmityColorToken.TextAvatarLabelDefault),
    },
  });

  return { styles, token };
};
