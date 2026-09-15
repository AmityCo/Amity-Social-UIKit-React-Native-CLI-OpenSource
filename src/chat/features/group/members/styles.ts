// Styles for GroupMembers — ported from AmityUiKitWeb GroupMembers.module.css.
// A full-height column filling the page background.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    groupMembers: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
  });

  return { styles, token };
};
