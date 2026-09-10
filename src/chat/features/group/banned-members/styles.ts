// Styles for BannedGroupMembers — ported from AmityUiKitWeb
// BannedGroupMembers.module.css. Column filling the page; search bar padding 8/16.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    bannedGroupMembers: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    searchBar: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
  });

  return { styles, token };
};
