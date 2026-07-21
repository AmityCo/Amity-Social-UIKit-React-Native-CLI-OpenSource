// Styles for the add-member Header — ported from AmityUiKitWeb Header.module.css.
// Column; search bar padding 0.5rem 1rem → 8/16.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'column',
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    searchBar: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
  });

  return { styles, token };
};
