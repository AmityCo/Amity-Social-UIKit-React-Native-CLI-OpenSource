// Styles for EditGroupMemberPermissions — ported from AmityUiKitWeb
// v4/chat/features/group/edit-permission/EditGroupMemberPermissions.module.css.
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
    // .editGroupMemberPermissions__sectionTitle — padding 1rem/1rem/0.5rem, list surface.
    sectionTitle: {
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 8,
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    // .editGroupMemberPermissions__radios — the radio rows share the list surface;
    // each Selection.Radio brings its own 1rem padding.
    radios: {
      width: '100%',
      flexDirection: 'column',
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
  });

  return { styles, token };
};
