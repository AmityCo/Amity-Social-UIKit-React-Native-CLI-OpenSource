// Styles for SelectedUsersBar — ported from AmityUiKitWeb
// v4/chat/features/group/select-member/components/SelectedUsersBar/
// SelectedUsersBar.module.css. Geometry: list gap 0.25rem→4, padding 0.5rem→8,
// divider height 0.0625rem→1. Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    selectedUsersBar: {
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
