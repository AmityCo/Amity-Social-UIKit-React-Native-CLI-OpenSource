// Styles for CreateGroupChat — ported from AmityUiKitWeb
// v4/chat/features/group/create/CreateGroupChat.module.css.
// Web `min-height: 100svh` → flex:1 (no svh in RN); avatar wrapper padding
// 1rem→16, centered. Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    createGroupChat: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    avatarWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
  });

  return { styles, token };
};
