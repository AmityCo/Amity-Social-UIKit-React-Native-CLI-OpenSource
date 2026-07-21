// PrivateBadge element — Badge.Icon with the chat/private (lock) preset.
// QA deviation from web: web's chat/private preset flips per theme (light =
// light-blue circle + blue lock; dark = blue circle + light lock). Per QA the
// lock must read WHITE in light, so we force a consistent blue circle + white
// lock in both themes via colour overrides (white icon + Primary/500 surface).
// Geometry (size/border) still comes from the preset.

import { Badge, type BadgeSize } from '../../atoms/Badge';
import { AmityColorToken } from '../../tokens/amity-color-tokens';

export type PrivateBadgeProps = {
  size?: BadgeSize;
  border?: boolean;
};

export function PrivateBadge({ size = 16, border = false }: PrivateBadgeProps) {
  return (
    <Badge.Icon
      icon="lock-keyhole-s"
      preset={{ family: 'chat', case: 'private' }}
      size={size}
      border={border}
      surfaceColorToken={AmityColorToken.SurfaceFeaturedIconSolid}
      iconColorToken={
        AmityColorToken.IconBadgeSemanticBadgeCommunityGeneralDefault
      }
    />
  );
}
