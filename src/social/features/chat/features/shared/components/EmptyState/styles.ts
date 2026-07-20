// Styles for EmptyState — ported from EmptyState.module.css.
// Geometry: gap 0.5rem→8, padding 1.5rem→24, icon 4rem→64, title max-width
// 15.75rem→252. `min-height: calc(100svh - …)` → flex:1 fill + center. Colours
// via tokens. `white-space: pre-line` is native to RN Text (\n honoured).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    emptyState: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 24,
    },
    text: {
      maxWidth: 252,
      textAlign: 'center',
      color: token(AmityColorToken.TextEmptyStateTitleDefault),
    },
  });

  return { styles, token };
};
