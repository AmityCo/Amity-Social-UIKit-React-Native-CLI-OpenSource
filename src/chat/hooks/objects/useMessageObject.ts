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

import { useEffect, useState } from 'react';
import { MessageRepository } from '@amityco/ts-sdk-react-native';

import useAuth from '../../../core/hooks/useAuth';

export type UseMessageObjectResult = {
  message?: Amity.Message;
  /**
   * Still resolving. Turns false on the first settled callback — including an
   * errored one — so a consumer always reaches a terminal state instead of
   * showing a loader forever. Web leaves `isLoading` true in that case and
   * spins indefinitely; we deliberately do not.
   */
  isLoading: boolean;
  error?: unknown;
};

export function useMessageObject(
  messageId?: string | null
): UseMessageObjectResult {
  // The SDK needs a connected client before getMessage can run.
  const { isConnected } = useAuth();
  const [message, setMessage] = useState<Amity.Message | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(undefined);

  useEffect(() => {
    // Nothing to resolve, or offline: stay in the loading state rather than
    // settling on "unavailable" for a message that is expected to arrive once
    // the connection is back.
    if (!isConnected || !messageId) {
      setIsLoading(true);
      return undefined;
    }

    // A new id must not keep showing the previous message.
    setMessage(undefined);
    setIsLoading(true);
    setError(undefined);

    const unsubscribe = MessageRepository.getMessage(
      messageId,
      ({ data, loading, error: liveError }) => {
        setMessage(data ?? undefined);
        setIsLoading(!liveError && loading);
        if (liveError) setError(liveError);
      }
    );

    return () => unsubscribe();
  }, [isConnected, messageId]);

  return { message, isLoading, error };
}
