// Styles for NotificationMode — ported from AmityUiKitWeb
// v4/chat/features/group/edit-notification/components/NotificationMode/NotificationMode.module.css.
// rem → px×16; colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // .notificationMode — flex column, 0.125rem gap, fills the row.
    container: {
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
  });

  return { styles, token };
};
