// Styles for the chat-search Header — ported from AmityUiKitWeb Header.module.css.
// header: row, align center, padding 0.75rem 1rem → 12/16, page-background surface.
// input: flex 1 1 auto, min-width 0 → flex:1 with a minWidth:0.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    input: {
      flex: 1,
      minWidth: 0,
    },
  });

  return { styles, token };
};
