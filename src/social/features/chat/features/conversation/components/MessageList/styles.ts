// Styles for the conversation MessageList. Rows align outbound (own) to the
// trailing edge and inbound (other) to the leading edge; list padding mirrors the
// web thread (horizontal 16, vertical gaps ~2). Colours via design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    list: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    content: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    // Scroll affordances float above the composer at the bottom of the list.
    scrollButtonSlot: {
      position: 'absolute',
      right: 12,
      bottom: 12,
    },
    newMessageSlot: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 12,
      alignItems: 'center',
    },
  });

  return { styles, token };
};
