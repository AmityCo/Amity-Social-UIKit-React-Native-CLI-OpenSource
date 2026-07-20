// MessageList — the conversation thread's scroll view, distilled from AmityUiKitWeb
// features/shared/components/MessageList. Uses an inverted FlatList (newest at the
// bottom), aligning own messages trailing and others' leading. Older pages load as
// the user scrolls up (onEndReached, since the list is inverted).

// 1. React / RN imports
import { useMemo } from 'react';
import { FlatList, View } from 'react-native';

// 2. Internal imports
import { AmityMessageBubble } from '../../../../components/AmityMessageBubble';
import { useStyles } from './styles';

// 3. Types
type MessageListProps = {
  messages: Amity.Message[];
  currentUserId?: string;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onLongPressMessage?: (message: Amity.Message) => void;
};

// 4. Named function component
export function MessageList({
  messages,
  currentUserId,
  hasNextPage,
  onLoadMore,
  onLongPressMessage,
}: MessageListProps) {
  const { styles } = useStyles();

  // Inverted list wants newest-first. Sort ascending by createdAt, then reverse.
  const data = useMemo(() => {
    const sorted = [...messages].sort(
      (a, b) =>
        new Date(a.createdAt as string).getTime() -
        new Date(b.createdAt as string).getTime()
    );
    return sorted.reverse();
  }, [messages]);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={data}
      inverted
      keyExtractor={(item) => item.messageId}
      renderItem={({ item }) => {
        const isUser = !!currentUserId && item.creatorId === currentUserId;
        return (
          <View style={[styles.row, isUser ? styles.rowOwn : styles.rowOther]}>
            <AmityMessageBubble
              message={item}
              isUser={isUser}
              onLongPress={onLongPressMessage}
            />
          </View>
        );
      }}
      onEndReached={hasNextPage ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
    />
  );
}
