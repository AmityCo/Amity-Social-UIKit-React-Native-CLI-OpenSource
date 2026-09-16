import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';

// Geometry from SoT tokens/geometry.json (avatarIcon) + web Avatar.module.css
// (rem -> px, x16). GroupChat wrapper radius 0.625rem = 10; badge offsets
// -0.125rem = -2 (default) and 0.25rem = 4 (lg).
// Width of the indicator ring the Avatar atom draws around the badge.
const MODERATOR_BADGE_RING = 3;
// Web `.avatar__userModeratorBadge` offset: -0.125rem.
const MODERATOR_BADGE_OVERHANG = 2;

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

    // PDT-5134 — web's `.avatar__userModeratorBadge` nudges the moderator badge
    // -0.125rem (-2) past the avatar frame on BOTH axes. The atom anchors the
    // indicator at right/bottom 0, but its 3px ring is a real `borderWidth` in
    // RN (web draws the same ring as a box-shadow, which takes no layout space),
    // so the 16px chip ends up 3px inside the frame. Shift by ring + overhang to
    // land the chip exactly where web puts it.
    userModeratorBadge: {
      right: -(MODERATOR_BADGE_RING + MODERATOR_BADGE_OVERHANG),
      bottom: -(MODERATOR_BADGE_RING + MODERATOR_BADGE_OVERHANG),
    },
  });

  return { styles };
};
