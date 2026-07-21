// Styles for AddMemberButton — ported from AmityUiKitWeb AddMemberButton.module.css.
// Padding 1rem → 16, top divider, page background.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      flexShrink: 0,
      padding: 16,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
      borderTopWidth: 1,
      borderTopColor: token(AmityColorToken.LineDividerPostDefault),
    },
  });

  return { styles, token };
};
