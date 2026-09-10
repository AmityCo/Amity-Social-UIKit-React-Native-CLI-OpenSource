// AmityIcon — render a SoT icon by name, tinted via a design token.
// RN has no svg-transformer configured, so icons are raw SVG xml (from the generated
// registry) rendered through react-native-svg's SvgXml, with the fill placeholder
// replaced by a resolved token colour.

import { SvgXml } from 'react-native-svg';
import { getIconXml, type AmityIconName } from './generated/iconRegistry';
import { useToken, type ColorTokenRef } from '../theme/useToken';

export interface AmityIconProps {
  name: AmityIconName;
  size?: number;
  /** Preferred: tint from a design token. */
  tokenColor?: ColorTokenRef;
  /** Escape hatch: explicit colour (falls back to the icon's default fill if unset). */
  color?: string;
}

export function AmityIcon({
  name,
  size = 24,
  tokenColor,
  color,
}: AmityIconProps) {
  const token = useToken();
  const fill = tokenColor ? token(tokenColor) : color;
  return <SvgXml xml={getIconXml(name, fill)} width={size} height={size} />;
}
