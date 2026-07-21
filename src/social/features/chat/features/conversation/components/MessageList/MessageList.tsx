// MessageList — the conversation thread's scroll view, ported from AmityUiKitWeb
// features/shared/components/MessageList. Renders the pre-grouped `items` (date
// separators + messages, newest-first) in an inverted FlatList, tracks whether the
// view is at the bottom (for scroll UX), and shows the ScrollToLatestButton /
// NewMessageNotification affordances. Older pages load on onEndReached.

// 1. React / RN imports
import { useCallback, useMemo, useRef } from 'react';
import { FlatList, View } from 'react-native';

// 2. Internal imports
import { MessageRow } from '../MessageRow';
import { DateSeparator } from '../../../shared/components/DateSeparator';
import { ScrollToLatestButton } from '../../../shared/components/ScrollToLatestButton';
import { NewMessageNotification } from '../../../shared/components/NewMessageNotification';
import type { ChatItem } from '../../../../utils/groupMessagesByDate';
import { useStyles } from './styles';

// 3. Types
type BubbleHandlers = {
  onEdit: () => void;
  onReply: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onSave: () => void;
  onReport: (message: Amity.Message) => void;
};

type MessageListProps = {
  items: ChatItem[];
  currentUserId?: string;
  isGroupChat?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  atBottom?: boolean;
  onAtBottomChange?: (atBottom: boolean) => void;
  newMessage?: Amity.Message | null;
  onClearNewMessage?: () => void;
  onOpenImage?: (url: string, message: Amity.Message) => void;
  onOpenVideo?: (message: Amity.Message) => void;
  onOpenFailedSheet?: (message: Amity.Message) => void;
  onOpenBubbleMenu?: (message: Amity.Message) => void;
  onSeeMore?: (text: string, title?: string) => void;
  bubbleHandlers?: BubbleHandlers;
};

const AT_BOTTOM_THRESHOLD = 48;

// 4. Named function component
export function MessageList({
  items,
  currentUserId,
  isGroupChat,
  hasMore,
  onLoadMore,
  atBottom = true,
  onAtBottomChange,
  newMessage,
  onClearNewMessage,
  onOpenImage,
  onOpenVideo,
  onOpenFailedSheet,
  onOpenBubbleMenu,
  onSeeMore,
  bubbleHandlers,
}: MessageListProps) {
  const { styles } = useStyles();
  const listRef = useRef<FlatList<ChatItem>>(null);

  // Final guard: never hand the FlatList two items with the same key (React throws
  // "same key" otherwise). Upstream already dedupes messages, but keep the list robust.
  const data = useMemo(() => {
    const seen = new Set<string>();
    return items.filter((it) => {
      if (seen.has(it.id)) return false;
      seen.add(it.id);
      return true;
    });
  }, [items]);

  // Resolve reply parents from the loaded items (no separate live lookup for M2).
  const messageById = useMemo(() => {
    const map = new Map<string, Amity.Message>();
    for (const it of data)
      if (it.kind === 'message') map.set(it.message.messageId, it.message);
    return map;
  }, [data]);

  const scrollToLatest = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    onClearNewMessage?.();
  }, [onClearNewMessage]);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      // Inverted list: offset near 0 == pinned to the newest (bottom) message.
      const next = e.nativeEvent.contentOffset.y < AT_BOTTOM_THRESHOLD;
      if (next !== atBottom) onAtBottomChange?.(next);
    },
    [atBottom, onAtBottomChange]
  );

  return (
    <View style={styles.list}>
      <FlatList
        ref={listRef}
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
              parent={
                message.parentId
                  ? messageById.get(message.parentId) ?? null
                  : null
              }
              onOpenImage={onOpenImage}
              onOpenVideo={onOpenVideo}
              onOpenFailedSheet={onOpenFailedSheet}
              onOpenBubbleMenu={onOpenBubbleMenu}
              onSeeMore={onSeeMore}
              bubbleHandlers={bubbleHandlers}
            />
          );
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={hasMore ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
      />

      {!atBottom && newMessage ? (
        <View style={styles.newMessageSlot}>
          <NewMessageNotification
            message={newMessage}
            onPress={scrollToLatest}
          />
        </View>
      ) : null}
      {!atBottom ? (
        <View style={styles.scrollButtonSlot}>
          <ScrollToLatestButton onPress={scrollToLatest} />
        </View>
      ) : null}
    </View>
  );
}
