// Styles for AmityConversationChatUserActionComponent — mirrors
// AmityMessageActionMenu. Surface chrome comes from the Popover; this only adds
// the inner padding (0.25rem → 4).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    menuContainer: {
      padding: 4,
    },
  });

  return { styles, token };
};
