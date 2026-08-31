// ModeratorBadge element — ported from AmityUiKitWeb core/design/elements/ModeratorBadge.
// Thin wrapper over the Badge atom: a bordered icon chip carrying the
// `userstatus/moderator` preset with the solid shield-check glyph.

import { Badge, type BadgeSize } from '../../atoms/Badge';

export type ModeratorBadgeProps = {
  size?: BadgeSize;
};

// Web hardcodes size=16 and the userstatus/moderator preset with ShieldCheck.Solid.
export function ModeratorBadge({ size = 16 }: ModeratorBadgeProps) {
  return (
    <Badge.Icon
      border
      icon="shield-check-s"
      preset={{ family: 'userstatus', case: 'moderator' }}
      size={size}
    />
  );
}
