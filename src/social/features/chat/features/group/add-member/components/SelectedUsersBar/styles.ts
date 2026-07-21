// Styles for SelectedUsersBar — ported from AmityUiKitWeb SelectedUsersBar.module.css.
// Horizontal list gap 0.25rem → 4, padding 0.5rem → 8, bottom divider.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
      borderBottomWidth: 1,
      borderBottomColor: token(AmityColorToken.LineDividerPostDefault),
    },
    list: {
      flexDirection: 'row',
      gap: 4,
      padding: 8,
    },
  });

  return { styles, token };
};
