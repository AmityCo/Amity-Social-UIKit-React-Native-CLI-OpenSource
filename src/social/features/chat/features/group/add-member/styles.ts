// Styles for AddGroupMember — ported from AmityUiKitWeb AddGroupMember.module.css.
// Column filling the page; the list flexes to fill between header and button.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    addGroupMember: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    list: {
      flex: 1,
      minHeight: 0,
    },
  });

  return { styles, token };
};
