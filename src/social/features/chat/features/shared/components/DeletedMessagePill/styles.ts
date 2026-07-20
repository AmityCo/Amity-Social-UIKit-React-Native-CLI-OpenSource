// Styles for DeletedMessagePill — ported from DeletedMessagePill.module.css.
// Geometry: gap 0.25rem→4, padding 0.25rem/0.5rem→4/8, border 0.0625rem→1,
// border-radius 1.25rem→20. `inline-flex` → alignSelf 'flex-start' so the pill
// hugs its content instead of stretching the row. Per-side colour resolved here
// (web `currentcolor` cascade has no RN equivalent).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = (isUser: boolean) => {
  const token = useToken();

  const labelColor = token(
    isUser
      ? AmityColorToken.TextChatBubbleOutboundMessagesDeleted
      : AmityColorToken.TextChatBubbleInboundMessagesDeleted
  );
  const borderColor = token(
    isUser
      ? AmityColorToken.BorderChatBubbleOutboundDeleted
      : AmityColorToken.BorderChatBubbleInboundDeleted
  );

  const styles = StyleSheet.create({
    pill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor,
      borderRadius: 20,
    },
    label: {
      color: labelColor,
    },
  });

  return { styles, token };
};
