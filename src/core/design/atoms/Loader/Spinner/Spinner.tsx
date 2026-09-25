// Spinner atom — ported from AmityUiKitWeb core/design/atoms/Loader/Spinner.
// Web draws a rotating two-tone SVG (track + arc); RN uses ActivityIndicator
// (single tint) per the port's simplicity rule. The track color has no
// ActivityIndicator slot, so only the arc/loader token is applied.

import { ActivityIndicator } from 'react-native';
import type { ColorTokenRef } from '../../../theme/useToken';
import { useStyles } from './styles';

export type SpinnerSize = 'sm' | 'lg';

export type SpinnerProps = {
  size?: SpinnerSize;
  tokenColor?: ColorTokenRef;
  accessibilityLabel?: string;
};

export function Spinner({
  size = 'lg',
  tokenColor,
  accessibilityLabel = 'Loading',
}: SpinnerProps) {
  const { color, dimension } = useStyles(size, tokenColor);

  return (
    <ActivityIndicator
      size={dimension}
      color={color}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    />
  );
}
