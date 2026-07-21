// Styles for Header — ported from AmityUiKitWeb Header.module.css.
// Geometry mirrors the web CSS (padding 0.75rem 1rem, gap 0.5rem → px ×16);
// colours resolve through design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
    title: {
      flex: 1,
      minWidth: 0,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    // web header__actions: flex 1 0 0, justify-content flex-end, gap 0.75rem→12
    actions: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
    },
  });

  return { styles };
};
