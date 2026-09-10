import { StyleSheet } from 'react-native';
import { useToken, type ColorTokenRef } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';
import type { BadgeFill, BadgeShape, BadgeSize } from './Badge';

// --- Geometry (SoT: geometry.json → badges; web CSS grid, rem × 16) ----------
// Label per-size: height / round-filled paddingX / fontSize.
// (size-24 sampled by geometry.json: label.text.size=13, label.round.paddingX=8.)
const LABEL_GEOMETRY: Record<
  BadgeSize,
  { height: number; paddingX: number; fontSize: number }
> = {
  14: { height: 14, paddingX: 4, fontSize: 10 },
  16: { height: 16, paddingX: 4, fontSize: 10 },
  20: { height: 20, paddingX: 6, fontSize: 12 },
  24: { height: 24, paddingX: 8, fontSize: 13 },
  28: { height: 28, paddingX: 8, fontSize: 13 },
  32: { height: 32, paddingX: 12, fontSize: 15 },
};

// Square shape narrows label horizontal padding (geometry.json label.square.paddingX=2).
const squarePaddingX = (
  fill: BadgeFill,
  size: BadgeSize
): number | undefined => {
  if (fill === 'filled' && (size === 14 || size === 16)) return 2;
  if (fill === 'ghost' && (size === 20 || size === 24 || size === 28)) return 2;
  if (fill === 'ghost' && size === 32) return 4;
  return undefined;
};

// Corner radius: square = 4 (geometry.json label.square.cornerRadius); round = full pill.
const SQUARE_RADIUS = 4;
const ROUND_RADIUS = 9999;
const BORDER_WIDTH = 1; // web ring: 0 0 0 0.0625rem

// --- Colour token resolution (preset → AmityColorToken refs) ------------------
export type BadgeColorTokens = {
  surface: ColorTokenRef;
  text: ColorTokenRef;
  icon: ColorTokenRef;
  border: ColorTokenRef;
};

const ATOMIC_TOKENS: BadgeColorTokens = {
  surface: AmityColorToken.SurfaceBadgeAtomicBadgeFilledDefault,
  text: AmityColorToken.TextBadgeAtomicBadgeDefault,
  icon: AmityColorToken.IconBadgeAtomicBadgeDefault,
  border: AmityColorToken.BorderBadgeAtomicBadgeDefault,
};

export function resolveBadgeTokens(slug?: string): BadgeColorTokens {
  switch (slug) {
    case 'general-notification':
      return {
        ...ATOMIC_TOKENS,
        surface: AmityColorToken.SurfaceBadgeSemanticBadgeGeneralNotification,
        text: AmityColorToken.TextBadgeSemanticBadgeGeneralDefaultDefault,
        border: AmityColorToken.BorderBadgeSemanticBadgeGeneralDefault,
      };
    case 'userstatus-moderator':
      return {
        ...ATOMIC_TOKENS,
        surface: AmityColorToken.SurfaceBadgeSemanticBadgeUserStatusModerator,
        icon: AmityColorToken.IconBadgeSemanticBadgeUserStatusModeratorDefault,
        border: AmityColorToken.BorderAvatarIndicatorDefault,
      };
    case 'chat-mention':
      return {
        ...ATOMIC_TOKENS,
        surface: AmityColorToken.SurfaceBadgeSemanticBadgeChatMention,
        icon: AmityColorToken.IconBadgeSemanticBadgeChatMentionDefault,
      };
    case 'chat-private':
      return {
        ...ATOMIC_TOKENS,
        surface: AmityColorToken.SurfaceBadgeSemanticBadgeChatPrivate,
        icon: AmityColorToken.IconBadgeSemanticBadgeChatPrivateDefault,
        border: AmityColorToken.BorderAvatarProfileDefault,
      };
    // userstatus/private — no Surface/UserStatus/Private token yet; stopgap
    // reuses the Moderator surface until the private surface token ships (matches web).
    case 'userstatus-private':
      return {
        ...ATOMIC_TOKENS,
        surface: AmityColorToken.SurfaceBadgeSemanticBadgeUserStatusModerator,
        icon: AmityColorToken.IconBadgeSemanticBadgeUserStatusPrivateDefault,
      };
    default:
      return ATOMIC_TOKENS;
  }
}

// --- Style hook ---------------------------------------------------------------
type UseStylesArgs = {
  variant: 'label' | 'icon';
  shape: BadgeShape;
  fill: BadgeFill;
  size: BadgeSize;
  border: boolean;
  tokens: BadgeColorTokens;
};

export const useStyles = ({
  variant,
  shape,
  fill,
  size,
  border,
  tokens,
}: UseStylesArgs) => {
  const token = useToken();

  const borderRadius = shape === 'square' ? SQUARE_RADIUS : ROUND_RADIUS;
  const backgroundColor =
    fill === 'ghost' ? 'transparent' : token(tokens.surface);
  const borderProps = border
    ? { borderWidth: BORDER_WIDTH, borderColor: token(tokens.border) }
    : null;

  const base = {
    alignSelf: 'flex-start' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius,
    backgroundColor,
    ...borderProps,
  };

  const label = LABEL_GEOMETRY[size];
  const paddingHorizontal =
    shape === 'square'
      ? squarePaddingX(fill, size) ?? label.paddingX
      : label.paddingX;

  const styles = StyleSheet.create({
    badge:
      variant === 'label'
        ? {
            ...base,
            height: label.height,
            paddingHorizontal,
          }
        : {
            ...base,
            width: size,
            height: size,
          },
    label: {
      color: token(tokens.text),
      fontSize: label.fontSize,
      fontWeight: '600',
      lineHeight: label.fontSize,
    },
  });

  return { styles };
};
