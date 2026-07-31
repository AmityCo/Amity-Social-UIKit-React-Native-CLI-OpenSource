// Styles for WaitingForNetwork — ported from AmityUiKitWeb
// v4/chat/elements/WaitingForNetwork.module.css. Geometry: gap 0.25rem→4.
// Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    waitingForNetwork: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      // Web pins this to flex-shrink: 0 — safe on a desktop header, but on a phone
      // the chat-list header has barely enough room and the label overflowed on top
      // of the action buttons. Allow it to shrink; the label ellipsizes instead.
      flexShrink: 1,
      minWidth: 0,
    },
    text: {
      flexShrink: 1,
      color: token(AmityColorToken.TextListTextDescriptionDefaultDefault),
    },
  });

  return { styles, token };
};
