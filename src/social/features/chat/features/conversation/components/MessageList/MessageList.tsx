// MessageList — the conversation thread's scroll view, distilled from AmityUiKitWeb
// features/shared/components/MessageList. Uses an inverted FlatList (newest at the
// bottom), aligning own messages trailing and others' leading. Older pages load as
// the user scrolls up (onEndReached, since the list is inverted).

// 1. React / RN imports
import { useMemo } from 'react';
import { FlatList } from 'react-native';

// 2. Internal imports
import { MessageRow } from '../MessageRow';
import { DateSeparator } from '../../../shared/components/DateSeparator';
import {
  groupMessagesByDate,
  type ChatItem,
} from '../../../../utils/groupMessagesByDate';
import { useStyles } from './styles';

// 3. Types
type MessageListProps = {
  messages: Amity.Message[];
  currentUserId?: string;
  isGroupChat?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onOpenImage?: (url: string, message: Amity.Message) => void;
  onOpenVideo?: (message: Amity.Message) => void;
  onReplyMessage?: (message: Amity.Message) => void;
  onEditMessage?: (message: Amity.Message) => void;
  onDeleteMessage?: (message: Amity.Message) => void;
};

// 4. Named function component
export function MessageList({
  messages,
  currentUserId,
  isGroupChat,
  hasNextPage,
  onLoadMore,
  onOpenImage,
  onOpenVideo,
  onReplyMessage,
  onEditMessage,
  onDeleteMessage,
}: MessageListProps) {
  const { styles } = useStyles();

  // Group chronologically (oldest → newest) with a date separator before each day,
  // then reverse so the inverted FlatList shows newest at the bottom with each date
  // divider sitting above its day's messages.
  const data = useMemo(() => {
    const sorted = [...messages].sort(
      (a, b) =>
        new Date(a.createdAt as string).getTime() -
        new Date(b.createdAt as string).getTime()
    );
    return groupMessagesByDate(sorted).reverse();
  }, [messages]);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={data}
      inverted
      keyExtractor={(item: ChatItem) => item.id}
      renderItem={({ item }: { item: ChatItem }) => {
        if (item.kind === 'date') return <DateSeparator label={item.label} />;
        const { message } = item;
        const isUser = !!currentUserId && message.creatorId === currentUserId;
        return (
          <MessageRow
            message={message}
            isUser={isUser}
            isGroupChat={isGroupChat}
            currentUserId={currentUserId}
            onOpenImage={onOpenImage}
            onOpenVideo={onOpenVideo}
            onReplyMessage={onReplyMessage}
            onEditMessage={onEditMessage}
            onDeleteMessage={onDeleteMessage}
          />
        );
      }}
      onEndReached={hasNextPage ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
    />
  );
}
