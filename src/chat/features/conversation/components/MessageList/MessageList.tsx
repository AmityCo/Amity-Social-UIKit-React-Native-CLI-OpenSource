// MessageList — the conversation thread's scroll view, ported from AmityUiKitWeb
// features/shared/components/MessageList. Renders the pre-grouped `items` (date
// separators + messages, newest-first) in an inverted FlatList, tracks whether the
// view is at the bottom (for scroll UX), and shows the ScrollToLatestButton /
// NewMessageNotification affordances. Older pages load on onEndReached.

// 1. React / RN imports
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, FlatList, View } from 'react-native';

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
  /** Called when the jump target turns out to be unreachable, so the anchor is dropped. */
  onJumpHandled?: () => void;
  /** True while messages newer than the loaded window exist (anchored collection only). */
  hasPrev?: boolean;
  onLoadPrev?: () => void;
};

const AT_BOTTOM_THRESHOLD = 48;

/** How long the jumped-to row shakes, matching web's 1s `message-list-bounce`. */
const BOUNCE_MS = 1000;

/** Delay before re-attempting a scrollToIndex that missed (see onScrollToIndexFailed). */
const JUMP_RETRY_MS = 250;

/** How many times that re-attempt is allowed before the jump gives up. */
const JUMP_MAX_RETRIES = 4;

// Web marks the jumped-to row with `message-list-bounce`: a 1s horizontal shake
// (translateX 0 → -10 at 40% → 0 at 50% → -5 at 60% → 0). RN has no keyframes,
// so the same stops are played as an Animated sequence. Transform only, so it
// runs on the native driver and cannot stutter the list.
//
// Wraps EVERY message row, not just the one bouncing. Mounting the wrapper only
// around the target changes that row's element type when the bounce ends, which
// remounts the whole subtree and resets the bubble's measuring state — the row
// drops back to its loading skeleton for a frame.
function BouncingRow({
  bouncing,
  children,
}: {
  bouncing: boolean;
  children: ReactNode;
}) {
  const shift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!bouncing) return undefined;
    const step = (toValue: number, duration: number) =>
      Animated.timing(shift, { toValue, duration, useNativeDriver: true });
    const animation = Animated.sequence([
      Animated.delay(200),
      step(-10, 200),
      step(0, 100),
      step(-5, 100),
      step(0, 200),
    ]);
    animation.start();
    return () => {
      animation.stop();
      shift.setValue(0);
    };
  }, [bouncing, shift]);

  return (
    <Animated.View style={{ transform: [{ translateX: shift }] }}>
      {children}
    </Animated.View>
  );
}

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
  onJumpHandled,
  hasPrev,
  onLoadPrev,
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

  // PDT-5252: jump to a searched message. The collection is already anchored on
  // it (useChatMessage passes `aroundMessageId`, as web does), so the row is in
  // the loaded window and this only has to scroll to it and flag the bounce.
  // Web's fallback is kept: if it is not there once loading has finished and
  // there is no more history, the message is unreachable — drop the anchor so
  // the collection falls back to the newest page. Each id is honoured once.
  const jumpedToRef = useRef<string | null>(null);
  const [bouncingMessageId, setBouncingMessageId] = useState<string | null>(
    null
  );
  // Prev-paging stays off until the jump has settled. The anchored list opens at
  // offset 0 — which in an inverted list is the NEWEST end — so onStartReached
  // would fire immediately, prepend a page of newer messages and shift every
  // index out from under the scroll that is still in flight.
  const [jumpSettled, setJumpSettled] = useState(!jumpToMessageId);

  // scrollToIndex is retried against freshly-found indices, never a captured
  // one: a page can land between the miss and the retry.
  const dataRef = useRef(data);
  dataRef.current = data;
  const jumpPendingRef = useRef<string | null>(null);
  const jumpRetryRef = useRef(0);

  // Web's isLoadingPrev: set when a newer page is asked for, cleared when the
  // collection stops loading.
  // FlatList fires onStartReached more than once for a single approach (measured:
  // twice, 60ms apart), and the state has not flushed by the second call — so the
  // guard has to be a ref or the newer page is requested twice.
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  const loadingPrevRef = useRef(false);
  useEffect(() => {
    if (!isLoading) {
      loadingPrevRef.current = false;
      setIsLoadingPrev(false);
    }
  }, [isLoading]);

  const settleJump = useCallback(() => {
    jumpPendingRef.current = null;
    jumpRetryRef.current = 0;
    setJumpSettled(true);
  }, []);

  const scrollToJumpTarget = useCallback((messageId: string) => {
    const index = dataRef.current.findIndex(
      (it) => it.kind === 'message' && it.message.messageId === messageId
    );
    if (index < 0) return false;
    jumpPendingRef.current = messageId;
    // viewPosition 0.5 centres the row — web's scrollIntoView({block:'center'}).
    // Not animated: web's scrollIntoView has no `behavior`, so it defaults to
    // 'auto' — an instant jump. Animating it travels the whole way through the
    // thread instead, which reads as the page flickering.
    listRef.current?.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: false,
    });
    return true;
  }, []);

  useEffect(() => {
    if (!jumpToMessageId || jumpedToRef.current === jumpToMessageId) return;
    if (data.length === 0) return;
    if (scrollToJumpTarget(jumpToMessageId)) {
      jumpedToRef.current = jumpToMessageId;
      setBouncingMessageId(jumpToMessageId);
      return;
    }
    if (!isLoading && !isLoadingFirstPage && !hasMore) {
      jumpedToRef.current = jumpToMessageId;
      settleJump();
      onJumpHandled?.();
    }
  }, [
    jumpToMessageId,
    data,
    isLoading,
    isLoadingFirstPage,
    hasMore,
    onJumpHandled,
    scrollToJumpTarget,
    settleJump,
  ]);

  // The bounce also marks the end of the jump: by the time it has played, the
  // scroll has either landed or run out of retries, so prev-paging can start.
  useEffect(() => {
    if (!bouncingMessageId) return undefined;
    const timer = setTimeout(() => {
      setBouncingMessageId(null);
      settleJump();
    }, BOUNCE_MS);
    return () => clearTimeout(timer);
  }, [bouncingMessageId, settleJump]);

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
  // lives there. Web's second (bottom / loadPrev) loader — the newer-messages
  // side, reached only from a jump — is the ListHeaderComponent for the same
  // reason. Web gates it on `isLoadingPrev && !isLoadingFirstPage`.
  const showTopLoader = !!isLoading && !isLoadingFirstPage;
  const showBottomLoader = isLoadingPrev && !isLoadingFirstPage;

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
        // Only ever set for a list opened on a jump target, because only an
        // anchored collection pages NEWER messages in — and those land at index
        // 0, which in an inverted list is the end the viewer is looking at. Left
        // to itself the list keeps its offset, so the content jumps by a page's
        // height and lands back near the start, which fires onStartReached again
        // and walks the whole way to the newest message. This is the native
        // equivalent of web's `scrollTop += diff` after a prepend. Not enabled
        // for normal threads: there it would stop an incoming message from
        // pushing itself into view at the bottom.
        maintainVisibleContentPosition={
          jumpToMessageId ? { minIndexForVisible: 1 } : undefined
        }
        ListFooterComponent={
          showTopLoader ? (
            <View style={styles.topLoader}>
              <Loader.Spinner size="sm" />
            </View>
          ) : null
        }
        ListHeaderComponent={
          showBottomLoader ? (
            // Same geometry as the top one — web's two loader classes are identical.
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
          const row = (
            <MessageRow
              message={message}
              localPreviewUrl={localPreviewUrl}
              onMediaLoaded={onMediaLoaded}
              isUser={isUser}
              isGroupChat={isGroupChat}
              currentUserId={currentUserId}
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
          return (
            <BouncingRow bouncing={message.messageId === bouncingMessageId}>
              {row}
            </BouncingRow>
          );
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // Rows are variable height, so scrollToIndex can miss on the first try
        // (an off-screen row has no measured layout yet). Nudge the list to the
        // estimated offset, then retry once the rows around it have laid out —
        // the effect above will not fire again on its own, since nothing in its
        // deps changed.
        // Rows are variable height, so scrollToIndex can miss on the first try
        // (an off-screen row has no measured layout yet). Nudge the list to the
        // estimated offset, then retry — re-finding the index rather than
        // reusing the one that missed, since a page may have landed meanwhile.
        onScrollToIndexFailed={({ averageItemLength, index }) => {
          listRef.current?.scrollToOffset({
            offset: averageItemLength * index,
            animated: false,
          });
          const messageId = jumpPendingRef.current;
          if (!messageId || jumpRetryRef.current >= JUMP_MAX_RETRIES) {
            settleJump();
            return;
          }
          jumpRetryRef.current += 1;
          setTimeout(() => {
            if (jumpPendingRef.current !== messageId) return;
            if (!scrollToJumpTarget(messageId)) settleJump();
          }, JUMP_RETRY_MS);
        }}
        onEndReached={hasMore ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
        // Inverted, so the list's START is the newest end. Web pages the same
        // direction from `atBottomNow && hasPrev`; this is the RN equivalent and
        // only ever fires for a collection anchored on a jump target.
        onStartReached={
          jumpSettled && hasPrev
            ? () => {
                if (loadingPrevRef.current) return;
                loadingPrevRef.current = true;
                setIsLoadingPrev(true);
                onLoadPrev?.();
              }
            : undefined
        }
        onStartReachedThreshold={0.1}
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
