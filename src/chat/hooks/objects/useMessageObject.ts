// useMessageObject — one message, resolved by id through a
// `MessageRepository.getMessage` live object.
//
// The RN counterpart of web's `chat/hooks/objects/useMessageObject`, which wraps
// `useLiveObjectV4` around the same repository call. iOS does the same thing in
// `ChatMessageBubbleViewModel.updateParentMessageForReply`:
// `chatManager.getMessage(messageId: parentId).observe { ... }`, with its
// MessageCache entry used only as a first paint.
//
// The point of all three is that a reply's parent is fetched from its
// `parentId`, never looked up in whatever page the list happens to have loaded —
// which is why neither web nor iOS ever had PDT-4927.
//
// Built on the shared `useLiveObject` wrapper, so subscribe/unsubscribe and the
// focus handling live in one place. Two behaviours are layered on top of it,
// both deliberate — see the comments at each.

import { useEffect, useState } from 'react';
import { MessageRepository } from '@amityco/ts-sdk-react-native';

import useAuth from '../../../core/hooks/useAuth';
import useLiveObject from '../../../core/hooks/objects/useLiveObject';

export type UseMessageObjectResult = {
  message?: Amity.Message;
  /**
   * Still resolving. Turns false on the first settled callback — including an
   * errored one — so a consumer always reaches a terminal state instead of
   * showing a loader forever.
   */
  isLoading: boolean;
  error?: unknown;
};

export function useMessageObject(
  messageId?: string | null
): UseMessageObjectResult {
  // The SDK needs a connected client before getMessage can run. Disconnected we
  // hold no subscription and stay loading rather than settling on "unavailable",
  // since the message is expected to resolve once the connection is back.
  const { isConnected } = useAuth();
  const enabled = !!isConnected && !!messageId;

  const { item, isLoading, error } = useLiveObject<
    string,
    Amity.Message,
    never
  >({
    fetcher: MessageRepository.getMessage,
    params: messageId ?? '',
    enabled,
  });

  // The wrapper only ever assigns on `response.data`, so it never forgets the
  // last message. A recycled row whose parentId changes would keep rendering the
  // previous parent until the new one arrived; pin what we return to the id it
  // was fetched for.
  const [loadedForId, setLoadedForId] = useState<string | null>(null);
  useEffect(() => {
    if (item && messageId) setLoadedForId(messageId);
  }, [item, messageId]);

  const message =
    item && loadedForId === messageId ? (item as Amity.Message) : undefined;

  return {
    message,
    // The wrapper mirrors the SDK's own `loading` flag, which leaves a message
    // that can never be fetched spinning forever — the exact failure PDT-4927 is
    // about, and one web still has (`isLoading || !parent` guards its spinner).
    // Treat an errored live object as settled instead.
    isLoading: enabled ? isLoading && !error : true,
    error: error ?? undefined,
  };
}
