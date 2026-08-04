// Styles for SelectedUsersBar — ported from AmityUiKitWeb SelectedUsersBar.module.css.
// Horizontal list gap 0.25rem → 4, padding 0.5rem → 8, divider height 0.0625rem → 1.
// The separator is a full-bleed child View (web `selectedUsersBar__divider`),
// matching the select-member sibling — not a container borderBottom.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    list: {
      flexDirection: 'row',
      gap: 4,
      padding: 8,
    },
    divider: {
      height: 1,
      backgroundColor: token(AmityColorToken.LineDividerPostDefault),
    },
  });

  return { styles, token };
};
