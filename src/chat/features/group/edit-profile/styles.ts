// Styles for EditGroupProfile — ported from AmityUiKitWeb
// v4/chat/features/group/edit-profile/EditGroupProfile.module.css.
// rem → px×16; colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    // .editGroupProfile__avatarWrapper — center, 1rem vertical padding.
    avatarWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
    },
  });

  return { styles, token };
};
