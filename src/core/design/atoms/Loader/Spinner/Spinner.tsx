// Spinner atom — ported from AmityUiKitWeb core/design/atoms/Loader/Spinner.
// Web draws a rotating two-tone SVG (track + arc); RN uses ActivityIndicator
// (single tint) per the port's simplicity rule. The track color has no
// ActivityIndicator slot, so only the arc/loader token is applied.

import { ActivityIndicator } from 'react-native';
import { useStyles } from './styles';

export type SpinnerSize = 'sm' | 'lg';

export type SpinnerProps = {
  size?: SpinnerSize;
  accessibilityLabel?: string;
};

export function Spinner({
  size = 'lg',
  accessibilityLabel = 'Loading',
}: SpinnerProps) {
  const { color, dimension } = useStyles(size);

  return (
    <ActivityIndicator
      size={dimension}
      color={color}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    />
  );
}
