// Styles for EditGroupNotification — ported from AmityUiKitWeb
// v4/chat/features/group/edit-notification/EditGroupNotification.module.css.
// rem → px×16; colours via design tokens (no hardcoded hex). The web
// `.editGroupNotification__radio` 1rem padding is provided by Selection.Radio
// itself; the list surface lives on the shared `radios` container.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // .editGroupNotification — full-height page surface.
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    // .editGroupNotification__radios — column of radio rows on the list surface.
    radios: {
      width: '100%',
      flexDirection: 'column',
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
  });

  return { styles, token };
};
