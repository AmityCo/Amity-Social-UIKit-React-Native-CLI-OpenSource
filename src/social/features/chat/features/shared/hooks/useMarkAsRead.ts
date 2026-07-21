// useMarkAsRead — ported from AmityUiKitWeb v4/chat/features/shared/hooks/useMarkAsRead.
// Marks the latest visible message as read once the viewer is at the bottom of
// the list, debounced so rapid scroll/append churn only fires one markRead.
//
// RN adaptations from web:
//   - Web debounced via `react-use`'s `useDebounce` (not a dependency here); we
//     reproduce it with a `useEffect` + `setTimeout` keyed on the same deps, and
//     define MARK_READ_DEBOUNCE_MS locally (web imported it from ~/v4/chat/constants).
//   - SDK method is identical: `Amity.Message#markRead()` (an instance method on
//     the message object, same as web). The task's SubChannelRepository /
//     MessageRepository hint resolves to this per-message call.
//   - Added `isConnected` gate (via useAuth) as mandated — web does not gate on
//     connection state; this is an intentional RN deviation matching the repo's
//     live-SDK-call convention (see hooks/collections/useChannelsCollection).

import { useEffect, useRef } from 'react';

import useAuth from '../../../../../../core/hooks/useAuth';

const MARK_READ_DEBOUNCE_MS = 500;

type UseMarkAsReadParams = {
  latestMessage: Amity.Message | null;
  atBottom: boolean;
  enabled: boolean;
};

export function useMarkAsRead({
  latestMessage,
  atBottom,
  enabled,
}: UseMarkAsReadParams) {
  const { isConnected } = useAuth();
  const lastMarkedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isConnected || !enabled || !atBottom || !latestMessage) return;
      const id = latestMessage.messageId;
      if (!id || lastMarkedIdRef.current === id) return;
      try {
        latestMessage.markRead();
        lastMarkedIdRef.current = id;
      } catch {
        // markRead failures are non-fatal; SDK will retry on the next visibility tick
      }
    }, MARK_READ_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [latestMessage?.messageId, atBottom, enabled, isConnected]);

  useEffect(() => {
    lastMarkedIdRef.current = null;
  }, [latestMessage?.subChannelId]);
}
