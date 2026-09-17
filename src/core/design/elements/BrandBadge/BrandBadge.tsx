// BrandBadge element — the verified-brand glyph shown beside a brand user's name.
//
// Web imports its BrandBadge from `~/v4/social/elements/BrandBadge`, but the chat
// UIKit must not take new chat → social dependencies (see CLAUDE.md), and the
// glyph itself already lives in core (`core/assets/icons.brand`). So the shared
// element lives here, next to the sibling ModeratorBadge / PrivateBadge.
//
// Web sizes it 1rem in the member row (.memberItem__brandBadge), which is the
// default here.

import { SvgXml, type XmlProps } from 'react-native-svg';

import { brand } from '../../../assets/icons';

export type BrandBadgeProps = Pick<
  XmlProps,
  'width' | 'height' | 'accessibilityLabel' | 'accessible'
>;

export function BrandBadge({
  width = 16,
  height = 16,
  ...rest
}: BrandBadgeProps) {
  return <SvgXml width={width} height={height} xml={brand()} {...rest} />;
}
