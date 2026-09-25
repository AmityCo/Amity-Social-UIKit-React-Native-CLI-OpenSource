// PrivateBadge element — Badge.Icon with the chat/private (lock) preset.
// Geometry (size/border) and colour both come from the preset, which resolves
// Surface/Badge/SemanticBadge/Chat/Private for the chip and
// Icon/Badge/SemanticBadge/Chat/Private/Default for the lock. Those two tokens
// swap roles between themes on purpose (tinted chip + saturated lock in light,
// saturated chip + tinted lock in dark), so the badge must NOT pin either side
// to a fixed colour.

import { Badge, type BadgeSize } from '../../atoms/Badge';

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
    />
  );
}
