// useChatMessage — ported from AmityUiKitWeb v4/chat/features/shared/hooks/useChatMessage.
// The conversation orchestration hook: owns the message list (grouped into date-
// separated items + optimistic synthetic messages), the composer, the bubble action
// menu, the media viewers, the failed-message sheet, see-more state, scroll state
// (atBottom / newMessage), edit state, and mark-as-read. Chat.tsx wires the returned
// values into the components with these exact props.
//
// RN adaptations vs web: web react-query useMessageCollection → RN useMessagesCollection
// (direct live collection); jump-to-message (aroundMessageId/hasPrev/loadPrev) is out of
// scope for M2 and stubbed; loading/error toasts go through the useChatNotifications stub.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useMessagesCollection } from '../../../hooks/collections/useMessagesCollection';
import {
  useChatNavigation,
  useChatNotifications,
  useCurrentUserId,
  useNetworkOnline,
} from '../../../hooks';
import { useString } from '../../../../../../core/localization';
import {
  groupMessagesByDate,
  type ChatItem,
} from '../../../utils/groupMessagesByDate';
import { useMarkAsRead } from './useMarkAsRead';
import {
  useMessageComposer,
  isSyntheticPendingMessage,
} from './useMessageComposer';
import { useBubbleMenu } from './useBubbleMenu';
import { useFailedMessageSheet } from './useFailedMessageSheet';
import { useMediaViewer } from './useMediaViewer';

type UseChatMessageParams = {
  channelId: string | undefined;
  isJustCreated?: boolean;
  enableMention?: boolean;
  viewerIsMutedInChannel?: boolean;
};

export function useChatMessage({
  channelId,
  isJustCreated,
  enableMention = false,
  viewerIsMutedInChannel = false,
}: UseChatMessageParams) {
  const { pop } = useChatNavigation();
  const { online: isOnline } = useNetworkOnline();
  const {
    error: errorToast,
    loading: showLoadingToast,
    remove: removeToast,
  } = useChatNotifications();
  const currentUserId = useCurrentUserId();
  const loadErrorToast = useString('amity_chat_load_error');
  const loadingLabel = useString('amity_chat_loading_label');
  const prevLatestIdRef = useRef<string | null>(null);
  // Guards show-once/remove-once for the loading toast (mirrors web's
  // `loadingToastIdRef`); RN's toast is a singleton with no ids.
  const loadingToastShownRef = useRef(false);
  const [atBottom, setAtBottom] = useState(true);
  const [seeMore, setSeeMore] = useState<{
    text: string;
    title?: string;
  } | null>(null);
  const [newMessage, setNewMessage] = useState<Amity.Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Amity.Message | null>(
    null
  );

  const {
    messages,
    loading,
    hasNextPage,
    loadMore,
    error: loadError,
  } = useMessagesCollection(
    { subChannelId: channelId ?? '', limit: 20, includeDeleted: true },
    !!channelId
  );

  const isLoadingFirstPage = !!channelId && loading && messages.length === 0;

  const closeEditMessage = useCallback(() => setEditingMessage(null), []);

  const composer = useMessageComposer({
    subChannelId: channelId ?? '',
    enableMention,
    editingMessage,
    onEditCompleted: closeEditMessage,
  });

  // Newest-first date-separated items (inverted list), with optimistic synthetic
  // pending messages prepended (they sit at the bottom of the inverted view).
  const items: ChatItem[] = useMemo(() => {
    // The live collection can momentarily hold the same messageId twice (pagination
    // merges, optimistic→real overlap). Dedupe so the list never renders two items
    // with the same key.
    const seen = new Set<string>();
    const deduped = messages.filter((m) => {
      if (!m.messageId || seen.has(m.messageId)) return false;
      seen.add(m.messageId);
      return true;
    });
    const chronological = deduped.sort(
      (a, b) =>
        new Date(a.createdAt as string).getTime() -
        new Date(b.createdAt as string).getTime()
    );
    const base = groupMessagesByDate(chronological).reverse();
    if (composer.syntheticMessages.length === 0) return base;
    const synthetic: ChatItem[] = composer.syntheticMessages
      .slice()
      .reverse()
      .map((m) => ({
        kind: 'message' as const,
        id: `synthetic-${m.__syntheticClientId}`,
        message: m as unknown as Amity.Message,
      }));
    return [...synthetic, ...base];
  }, [messages, composer.syntheticMessages]);

  // The newest message BY createdAt — NOT messages[length-1]. The SDK collection
  // is newest-first and paginating older pages appends to the end, so [length-1]
  // is the oldest loaded message and changes on scroll-up; using it made the
  // new-message banner fire on plain scroll (QA #0/#11). Max-by-createdAt is
  // order-independent, so it only changes when a genuinely newer message arrives.
  const latestMessage = useMemo(() => {
    if (messages.length === 0) return null;
    return messages.reduce((a, b) =>
      new Date(b.createdAt as string).getTime() >
      new Date(a.createdAt as string).getTime()
        ? b
        : a
    );
  }, [messages]);

  const {
    bubbleMenu,
    openBubbleMenu,
    closeBubbleMenu,
    handleBubbleDelete,
    handleBubbleEdit,
    handleBubbleReply,
    handleBubbleCopy,
    handleBubbleSave,
    handleBubbleReport,
    handleOpenReactorListSheet,
    reportMessage,
    closeReport,
  } = useBubbleMenu({
    onEditMessage: setEditingMessage,
    onReplyMessage: composer.startReply,
    viewerIsMutedInChannel,
  });

  const { openFailedSheet } = useFailedMessageSheet({
    onRetryUpload: composer.handleRetryUpload,
    onDiscardUpload: composer.handleDiscardUpload,
    onRetryText: composer.handleRetryText,
    onDiscardText: composer.handleDiscardText,
  });

  const {
    openImageViewer,
    openVideoPlayer,
    imageViewerProps,
    videoPlayerProps,
  } = useMediaViewer();

  useMarkAsRead({
    latestMessage,
    atBottom,
    enabled: !!channelId && !!latestMessage,
  });

  useEffect(() => {
    if (loadError) errorToast({ content: loadErrorToast });
  }, [loadError, errorToast, loadErrorToast]);

  // Web useChatMessage shows a loading toast ("Loading chat...") while the first
  // page loads and removes it once loaded (duration 60s = upper bound). RN's toast
  // is a singleton (no ids), so the ref guards show-once/remove-once — correct
  // regardless of the fresh notification-fn identities returned each render, which
  // is why `showLoadingToast`/`removeToast` are intentionally out of the deps.
  useEffect(() => {
    if (isLoadingFirstPage) {
      if (loadingToastShownRef.current) return;
      loadingToastShownRef.current = true;
      showLoadingToast({ content: loadingLabel, duration: 60_000 });
    } else if (loadingToastShownRef.current) {
      loadingToastShownRef.current = false;
      removeToast();
    }
  }, [isLoadingFirstPage, channelId]);

  // Clear a lingering loading toast if the screen unmounts mid-load (singleton toast).
  useEffect(() => {
    return () => {
      if (loadingToastShownRef.current) {
        loadingToastShownRef.current = false;
        removeToast();
      }
    };
  }, []);

  // Surface a "new message" pill when a message arrives while scrolled up.
  useEffect(() => {
    const currentId = latestMessage?.messageId ?? null;
    const prevId = prevLatestIdRef.current;
    prevLatestIdRef.current = currentId;
    if (!currentId || !prevId || currentId === prevId) return;
    if (atBottom) return;
    setNewMessage(latestMessage);
  }, [latestMessage?.messageId, atBottom, latestMessage]);

  useEffect(() => {
    if (atBottom) setNewMessage(null);
  }, [atBottom]);

  const clearNewMessage = useCallback(() => setNewMessage(null), []);
  const openSeeMore = useCallback(
    (text: string, title?: string) => setSeeMore({ text, title }),
    []
  );
  const closeSeeMore = useCallback(() => setSeeMore(null), []);

  return {
    currentUserId,
    items,
    isLoadingFirstPage,
    isLoading: loading,
    hasMore: hasNextPage,
    loadMore,
    latestMessage,
    isOnline,
    atBottom,
    setAtBottom,
    seeMore,
    openSeeMore,
    closeSeeMore,
    newMessage,
    clearNewMessage,
    viewerIsMutedInChannel,
    handleBack: pop,
    composer,
    bubbleMenu,
    openBubbleMenu,
    closeBubbleMenu,
    handleBubbleDelete,
    handleBubbleEdit,
    handleBubbleReply,
    handleBubbleCopy,
    handleBubbleSave,
    handleBubbleReport,
    handleOpenReactorListSheet,
    reportMessage,
    closeReport,
    editingMessage,
    closeEditMessage,
    openFailedSheet,
    openImageViewer,
    openVideoPlayer,
    imageViewerProps,
    videoPlayerProps,
    isJustCreated,
    isSyntheticPendingMessage,
  };
}
