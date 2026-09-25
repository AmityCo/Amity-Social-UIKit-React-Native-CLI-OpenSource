// abbreviateCount — verbatim port of AmityUiKitWeb v4/utils/abbreviateCount.ts.
// Kept separate from core/utils/number.ts `formatNumber` on purpose: web's
// reaction UI uses THIS format ("1.0K"/"1.0M", no "B", no trailing-zero strip),
// so matching web 1:1 requires the exact web function.
export const abbreviateCount = (count: number): string | number => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  } else {
    return count;
  }
};
