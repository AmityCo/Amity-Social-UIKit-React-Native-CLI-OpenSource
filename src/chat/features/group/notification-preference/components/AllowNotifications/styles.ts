// Styles for AllowNotifications — ported from AmityUiKitWeb
// v4/chat/features/group/notification-preference/components/AllowNotifications/AllowNotifications.module.css.
// rem → px×16; colours via design tokens (no hardcoded hex). The `[data-disabled]`
// text colours become the `*Disabled` style variants.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // .allowNotifications — row, 0.75rem gap, 1rem padding, list surface.
    container: {
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      alignItems: 'flex-start',
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
    // .allowNotifications__textBlock — grows, 0.125rem gap.
    textBlock: {
      flex: 1,
      flexDirection: 'column',
      gap: 2,
      minWidth: 0,
    },
    title: {
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    description: {
      color: token(AmityColorToken.TextListTextDescriptionDefaultDefault),
    },
    // [data-disabled='true'] variants.
    titleDisabled: {
      color: token(AmityColorToken.TextListHeaderDefaultDisabled),
    },
    descriptionDisabled: {
      color: token(AmityColorToken.TextListTextDescriptionDefaultDisabled),
    },
  });

  return { styles, token };
};
