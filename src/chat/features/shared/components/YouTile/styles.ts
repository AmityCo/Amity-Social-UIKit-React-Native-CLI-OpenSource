// Styles for YouTile — ported from YouTile.module.css.
// Geometry: column, center, gap 0.25rem→4, tile width 4rem→64. Label colour
// from Text/Avatar/Label/Default.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

// Moderator badge on the 40px "You" avatar, matched against the New group Figma:
// a 16px chip with only a hairline white ring, centred on the avatar's
// bottom-right edge. The Avatar atom draws a 3px ring around any indicator;
// that is far thicker than the design here, so the ring is zeroed and the
// badge's own 1px white border (Border/Avatar/Indicator/Default) is the ring.
// Centring a 16px box on the 40px circle's 45° point puts its centre at ~34,
// i.e. 2px past the frame.
export const MODERATOR_BADGE_SIZE = 16;
const MODERATOR_BADGE_RING = 0;
const MODERATOR_BADGE_OVERHANG = 2;

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    tile: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      width: 64,
    },
    name: {
      maxWidth: 64,
      textAlign: 'center',
      color: token(AmityColorToken.TextAvatarLabelDefault),
    },
    // Override the atom's 3px ring and anchor, then shift the chip out so it
    // straddles the frame edge as in the design.
    moderatorBadge: {
      borderWidth: MODERATOR_BADGE_RING,
      right: -(MODERATOR_BADGE_RING + MODERATOR_BADGE_OVERHANG),
      bottom: -(MODERATOR_BADGE_RING + MODERATOR_BADGE_OVERHANG),
    },
  });

  return { styles, token };
};
