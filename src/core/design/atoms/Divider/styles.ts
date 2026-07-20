import { StyleSheet } from 'react-native';
import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';
import type { DividerOrientation, DividerVariant } from './Divider';

// Hairline thickness = 1 (SoT geometry.divider.types[].thickness). Label font 13px (web 0.8125rem).
export const useStyles = (
  variant: DividerVariant,
  orientation: DividerOrientation,
  inset: boolean
) => {
  const token = useToken();
  const lineColor = token(
    variant === 'content'
      ? AmityColorToken.LineDividerContentDefault
      : AmityColorToken.LineDividerPostDefault
  );

  const bar =
    orientation === 'horizontal'
      ? {
          height: 1,
          width: inset ? ('auto' as const) : ('100%' as const),
          marginHorizontal: inset ? 16 : 0,
        }
      : {
          width: 1,
          height: inset ? ('auto' as const) : ('100%' as const),
          marginVertical: inset ? 16 : 0,
        };

  const styles = StyleSheet.create({
    divider: { backgroundColor: lineColor, ...bar },
    labeled: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    line: { flex: 1, height: 1, backgroundColor: lineColor },
    label: {
      flexShrink: 0,
      fontSize: 13,
      color: token(AmityColorToken.TextDividerDefault),
    },
  });

  return { styles };
};
