// AmityMessageBubble — ported from AmityUiKitWeb features/shared/components/MessageBubble
// (text path). Renders one message's bubble: outbound (own) vs inbound (other),
// with a deleted-message fallback. Media (image/video) and see-more/link-preview
// are layered in later M2 tasks. Long-press surfaces the message action menu.

// 1. React / RN imports
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

// 2. Internal imports
import { useString } from '../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type AmityMessageBubbleProps = {
  message: Amity.Message;
  isUser: boolean;
  onLongPress?: (message: Amity.Message) => void;
};

// 4. Named function component
export function AmityMessageBubble({
  message,
  isUser,
  onLongPress,
}: AmityMessageBubbleProps) {
  const { styles } = useStyles();
  const [pressed, setPressed] = useState(false);
  const deletedLabel = useString('amity_chat_message_deleted');

  const text = message.isDeleted
    ? deletedLabel
    : (message.data as { text?: string })?.text ?? '';

  const bubbleStyle = [
    styles.bubble,
    isUser ? styles.bubbleOwn : styles.bubbleOther,
    pressed && (isUser ? styles.bubbleOwnPressed : styles.bubbleOtherPressed),
  ];
  const textStyle = [
    styles.text,
    isUser ? styles.textOwn : styles.textOther,
    message.isDeleted && styles.deletedText,
  ];

  return (
    <Pressable
      style={bubbleStyle}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onLongPress={
        message.isDeleted || !onLongPress
          ? undefined
          : () => onLongPress(message)
      }
      disabled={message.isDeleted}
    >
      <View>
        <Text style={textStyle}>{text}</Text>
      </View>
    </Pressable>
  );
}
