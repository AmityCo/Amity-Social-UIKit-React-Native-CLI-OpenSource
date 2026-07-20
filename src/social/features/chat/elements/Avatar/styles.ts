import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

// Geometry from SoT tokens/geometry.json (avatarIcon) + web Avatar.module.css
// (rem -> px, x16). GroupChat wrapper radius 0.625rem = 10; badge offsets
// -0.125rem = -2 (default) and 0.25rem = 4 (lg).
export const useStyles = () => {
  const token = useToken();
  const surface = token(AmityColorToken.SurfaceAvatarProfileDefault);

  const styles = StyleSheet.create({
    // Avatar.User deleted placeholder — circular, holds the solid user glyph.
    userDeleted: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9999,
      backgroundColor: surface,
    },

    // Avatar.GroupChat — fills its parent (parent-driven size, like web 100%).
    groupChat: {
      position: 'relative',
      width: '100%',
      height: '100%',
    },
    groupChatImageWrapper: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
      overflow: 'hidden',
    },
    groupChatImage: {
      width: '100%',
      height: '100%',
    },
    groupChatPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: surface,
    },
    privateBadge: {
      position: 'absolute',
    },
  });

  return { styles };
};
