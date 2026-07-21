// Styles for SelectGroupMember — ported from AmityUiKitWeb
// v4/chat/features/group/select-member/SelectGroupMember.module.css.
// Web `min-height: 100svh` → flex:1 (no svh in RN). Colours via design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    selectGroupMember: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
  });

  return { styles, token };
};
