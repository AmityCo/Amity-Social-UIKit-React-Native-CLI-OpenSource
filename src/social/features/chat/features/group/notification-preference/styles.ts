// Styles for NotificationPreference — ported from AmityUiKitWeb
// v4/chat/features/group/notification-preference/NotificationPreference.module.css.
// rem → px×16; colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // .notificationPreference — full-height page surface.
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
  });

  return { styles, token };
};
