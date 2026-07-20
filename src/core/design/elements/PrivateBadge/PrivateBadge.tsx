// PrivateBadge element — ported from AmityUiKitWeb core/design/elements/PrivateBadge.
// Thin wrapper over Badge.Icon with the chat/private (lock) preset. Colour and
// geometry are delegated entirely to Badge via the preset + size/border props.

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
