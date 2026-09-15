// MessageList — the conversation thread's scroll view, ported from AmityUiKitWeb
// features/shared/components/MessageList. Renders the pre-grouped `items` (date
// separators + messages, newest-first) in an inverted FlatList, tracks whether the
// view is at the bottom (for scroll UX), and shows the ScrollToLatestButton /
// NewMessageNotification affordances. Older pages load on onEndReached.

// 1. React / RN imports
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, View } from 'react-native';

// 2. Internal imports
import { MessageRow } from '../MessageRow';
import { DateSeparator } from '../../../shared/components/DateSeparator';
import { ScrollToLatestButton } from '../../../shared/components/ScrollToLatestButton';
import { NewMessageNotification } from '../../../shared/components/NewMessageNotification';
import { Loader } from '../../../../../core/design/atoms/Loader';
import type { ChatItem } from '../../../../utils/groupMessagesByDate';
import {
  isSyntheticPendingMessage,
  type PendingUpload,
} from '../../../shared/hooks/useMessageComposer';
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
  /** True while a page (older messages) is loading — drives the top loader. */
  isLoading?: boolean;
  /** True during the very first page load (parent shows a skeleton; the list
   *  suppresses its own loader then, mirroring web). */
  isLoadingFirstPage?: boolean;
  atBottom?: boolean;
  onAtBottomChange?: (atBottom: boolean) => void;
  newMessage?: Amity.Message | null;
  onClearNewMessage?: () => void;
  onOpenImage?: (url: string, message: Amity.Message) => void;
  onOpenVideo?: (message: Amity.Message) => void;
  onOpenFailedSheet?: (message: Amity.Message) => void;
  onOpenBubbleMenu?: (message: Amity.Message) => void;
  onOpenReactorList?: (message: Amity.Message) => void;
  onSeeMore?: (text: string, title?: string) => void;
  bubbleHandlers?: BubbleHandlers;
  /** Viewer moderates this channel — unlocks Delete on other people's messages. */
  viewerIsModerator?: boolean;
  /**
   * In-flight/failed uploads, used to give each media bubble its local preview.
   * Web derives the same thing in its MessageList (pendingPreviewByClientId /
   * ByFileId) — without it a failed upload has no image source at all and the
   * bubble short-circuits to the loading placeholder, hiding its failed caption.
   */
  pendingUploads?: PendingUpload[];
  /**
   * The remote media for a just-uploaded file has finished loading, so its local
   * preview can be dropped (web GroupChat → MessageList → MessageBubble
   * `onMediaLoaded`). Without it a successful upload stays in `pendingUploads`
   * for as long as the thread is open and the bubble keeps rendering the local
   * file uri instead of the CDN url.
   */
  onMediaLoaded?: (fileId: string) => void;
  /**
   * Scroll to this message once it is in the loaded window, centred (PDT-5252).
   * Set when the thread is opened from a message search result.
   */
  jumpToMessageId?: string;
};

const AT_BOTTOM_THRESHOLD = 48;

/**
 * How many extra pages of history the jump will pull in looking for its target
 * before giving up. The thread opens at the newest page, so a match from far up
 * the history needs paging; the cap keeps a message that is not reachable (or
 * was deleted) from paging the whole channel in.
 */
const JUMP_MAX_PAGES = 10;

/** Delay before re-attempting a scrollToIndex that missed (see onScrollToIndexFailed). */
const JUMP_RETRY_MS = 250;

/** Web MessageList: pendingPreviewByClientId + pendingPreviewByFileId. A synthetic
 *  message is matched by its client id; once the upload has a fileId the real
 *  message takes over and is matched by that instead. */
function buildPreviewMaps(pendingUploads: PendingUpload[] | undefined) {
  const byClientId = new Map<string, string>();
  const byFileId = new Map<string, string>();
  for (const p of pendingUploads ?? []) {
    if (!p.previewUrl) continue;
    byClientId.set(p.clientId, p.previewUrl);
    if (p.fileId) byFileId.set(p.fileId, p.previewUrl);
  }
  return { byClientId, byFileId };
}

// 4. Named function component
export function MessageList({
  items,
  currentUserId,
  isGroupChat,
  hasMore,
  onLoadMore,
  isLoading = false,
  isLoadingFirstPage = false,
  atBottom = true,
  onAtBottomChange,
  newMessage,
  onClearNewMessage,
  onOpenImage,
  onOpenVideo,
  onOpenFailedSheet,
  onOpenBubbleMenu,
  onOpenReactorList,
  onSeeMore,
  bubbleHandlers,
  viewerIsModerator = false,
  pendingUploads,
  onMediaLoaded,
  jumpToMessageId,
}: MessageListProps) {
  const { styles } = useStyles();
  const previews = useMemo(
    () => buildPreviewMaps(pendingUploads),
    [pendingUploads]
  );
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

  // PDT-5252: jump to a searched message. Web opens the thread on a collection
  // anchored around the message; RN's collection always starts at the newest
  // page, so we scroll when the target is loaded and otherwise page backwards
  // until it is (bounded by JUMP_MAX_PAGES). Each id is honoured once.
  const jumpedToRef = useRef<string | null>(null);
  const jumpPagesRef = useRef(0);
  useEffect(() => {
    if (!jumpToMessageId || jumpedToRef.current === jumpToMessageId) return;
    const index = data.findIndex(
      (it) => it.kind === 'message' && it.message.messageId === jumpToMessageId
    );
    if (index >= 0) {
      jumpedToRef.current = jumpToMessageId;
      jumpPagesRef.current = 0;
      // viewPosition 0.5 centres the row, which is what QA asked for.
      listRef.current?.scrollToIndex({
        index,
        viewPosition: 0.5,
        animated: true,
      });
      return;
    }
    if (hasMore && !isLoading && jumpPagesRef.current < JUMP_MAX_PAGES) {
      jumpPagesRef.current += 1;
      onLoadMore?.();
    }
  }, [jumpToMessageId, data, hasMore, isLoading, onLoadMore]);

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

  // Web MessageList shows a top loader (`.messageList__topLoader` + Loader.Spinner)
  // while paginating older messages, suppressed during the first-page load (which the
  // parent covers with a skeleton). In an inverted FlatList the visual top — the
  // older-messages / onEndReached side — is the ListFooterComponent, so the spinner
  // lives there. Web's second (bottom / loadPrev) loader maps to jump-to-message,
  // which is out of scope for this port (see useChatMessage), so it is omitted.
  const showTopLoader = !!isLoading && !isLoadingFirstPage;

  // Match web's mutually-exclusive affordances: the new-message banner shows only
  // when a genuinely new message arrived while scrolled away (`newMessage` is gated
  // upstream in useChatMessage); the scroll-to-latest button shows otherwise. This
  // keeps the banner from co-appearing with the button (web: showScrollButton =
  // !atBottom && !newMessage && isScrollable — the isScrollable guard is dropped as a
  // documented deviation: an inverted list not at bottom is by definition scrollable).
  const showNotification = !atBottom && !!newMessage;
  const showScrollButton = !atBottom && !newMessage;

  return (
    <View style={styles.list}>
      <FlatList
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.content}
        data={data}
        inverted
        ListFooterComponent={
          showTopLoader ? (
            <View style={styles.topLoader}>
              <Loader.Spinner size="sm" />
            </View>
          ) : null
        }
        keyExtractor={(item: ChatItem) => item.id}
        renderItem={({ item }: { item: ChatItem }) => {
          if (item.kind === 'date') return <DateSeparator label={item.label} />;
          const { message } = item;
          const isUser = !!currentUserId && message.creatorId === currentUserId;
          const messageFileId =
            (message.data as { fileId?: string } | undefined)?.fileId ??
            (message as unknown as { fileId?: string }).fileId;
          const localPreviewUrl = isSyntheticPendingMessage(message)
            ? previews.byClientId.get(message.__syntheticClientId)
            : messageFileId
            ? previews.byFileId.get(messageFileId)
            : undefined;
          return (
            <MessageRow
              message={message}
              localPreviewUrl={localPreviewUrl}
              onMediaLoaded={onMediaLoaded}
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
              onOpenReactorList={onOpenReactorList}
              onSeeMore={onSeeMore}
              bubbleHandlers={bubbleHandlers}
              viewerIsModerator={viewerIsModerator}
            />
          );
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // Rows are variable height, so scrollToIndex can miss on the first try
        // (an off-screen row has no measured layout yet). Nudge the list to the
        // estimated offset, then retry once the rows around it have laid out —
        // the effect above will not fire again on its own, since nothing in its
        // deps changed.
        onScrollToIndexFailed={({ averageItemLength, index }) => {
          listRef.current?.scrollToOffset({
            offset: averageItemLength * index,
            animated: false,
          });
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index,
              viewPosition: 0.5,
              animated: true,
            });
          }, JUMP_RETRY_MS);
        }}
        onEndReached={hasMore ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
      />

      {showNotification && newMessage ? (
        <View style={styles.newMessageSlot}>
          <NewMessageNotification
            message={newMessage}
            onPress={scrollToLatest}
          />
        </View>
      ) : null}
      {showScrollButton ? (
        <View style={styles.scrollButtonSlot}>
          <ScrollToLatestButton onPress={scrollToLatest} />
        </View>
      ) : null}
    </View>
  );
}
