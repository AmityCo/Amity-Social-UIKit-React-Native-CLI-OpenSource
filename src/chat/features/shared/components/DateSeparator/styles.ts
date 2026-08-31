// Styles for DateSeparator — ported from DateSeparator.module.css.
// Geometry: outer paddingVertical 0.5rem→8; pill padding 0.25rem/0.5rem→4/8,
// border-radius 1rem→16. Colours via tokens.
//
// Shadow: web's pill relies on a box-shadow for definition — without it the pill
// blends into a light message-list background. Web's shadow colours are RAW rgba
// (NOT design tokens — there is no shadow token to map to), so we port them verbatim
// as rgb()+opacity. rgb()/rgba() (no `#`) is intentionally allowed by the no-hex gate;
// dropping the shadow would be an unfaithful silent simplification.
// web: 0 0 2px rgb(40 41 61 /10%), 0 2px 4px rgb(96 97 112 /16%) → RN approximates the
// dominant drop layer (iOS shadow* + Android elevation).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    dateSeparator: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    pill: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 16,
      backgroundColor: token(
        AmityColorToken.SurfaceDateAndTimeDateSeparatorDefault
      ),
      // web box-shadow (raw rgba, non-tokenized) — ported so the pill reads on light bg
      shadowColor: 'rgb(96, 97, 112)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.16,
      shadowRadius: 4,
      elevation: 2,
    },
    label: {
      color: token(AmityColorToken.TextDateAndTimeDateSeparatorDefault),
    },
  });

  return { styles, token };
};
