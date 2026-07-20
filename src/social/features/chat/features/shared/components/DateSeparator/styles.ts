// Styles for DateSeparator — ported from DateSeparator.module.css.
// Geometry: outer paddingVertical 0.5rem→8; pill padding 0.25rem/0.5rem→4/8,
// border-radius 1rem→16. box-shadow dropped (RN, no hex allowed). Colours via tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

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
    },
    label: {
      color: token(AmityColorToken.TextDateAndTimeDateSeparatorDefault),
    },
  });

  return { styles, token };
};
