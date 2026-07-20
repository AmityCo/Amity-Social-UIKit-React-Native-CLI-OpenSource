// DeletedMessagePill — ported from AmityUiKitWeb features/shared/components/DeletedMessagePill.
// An outlined pill with a trash glyph + "This message was deleted". Web relies on
// CSS `currentcolor` to tint icon/text/border from one `color` per data-user side;
// RN has no `currentcolor`, so the side colour is resolved explicitly for the icon
// (tokenColor) and for the border/label (styles).

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type DeletedMessagePillProps = {
  isUser: boolean;
};

// 4. Named function component
export function DeletedMessagePill({ isUser }: DeletedMessagePillProps) {
  const { styles } = useStyles(isUser);
  const deletedLabel = useString('amity_chat_message_deleted');

  const iconColor = isUser
    ? AmityColorToken.TextChatBubbleOutboundMessagesDeleted
    : AmityColorToken.TextChatBubbleInboundMessagesDeleted;

  return (
    <View style={styles.pill}>
      <AmityIcon name="trash-r" size={16} tokenColor={iconColor} />
      <Typography variant="caption" style={styles.label} numberOfLines={1}>
        {deletedLabel}
      </Typography>
    </View>
  );
}
