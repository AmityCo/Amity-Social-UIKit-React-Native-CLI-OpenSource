import { useToken } from '../../../theme/useToken';
import { AmityColorToken } from '../../../tokens/amity-color-tokens';
import type { SpinnerSize } from './Spinner';

// Geometry (SoT: Spinner.module.css, rem × 16): sm 1.5rem → 24, lg 2.5rem → 40.
const DIMENSION: Record<SpinnerSize, number> = {
  sm: 24,
  lg: 40,
};

export const useStyles = (size: SpinnerSize) => {
  const token = useToken();

  return {
    // Web arc uses --asc-color-surface-loaders-spinner-icon; the RN token set
    // exposes SurfaceLoadersSpinnerPrimaryIcon (no ...Icon), which is the same slot.
    color: token(AmityColorToken.SurfaceLoadersSpinnerPrimaryIcon),
    dimension: DIMENSION[size],
    token,
  };
};
