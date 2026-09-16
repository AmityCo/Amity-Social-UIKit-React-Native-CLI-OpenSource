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

import { MessageRepository } from '@amityco/ts-sdk-react-native';

import useAuth from '../../../core/hooks/useAuth';
import useLiveObject from '../../../core/hooks/objects/useLiveObject';

export type UseMessageObjectResult = {
  message?: Amity.Message;
  isLoading: boolean;
  error?: unknown;
};

export function useMessageObject(
  messageId?: string | null
): UseMessageObjectResult {
  // The SDK needs a connected client before getMessage can run.
  const { isConnected } = useAuth();

  const { item, isLoading, error } = useLiveObject<
    string,
    Amity.Message,
    never
  >({
    fetcher: MessageRepository.getMessage,
    params: messageId ?? '',
    enabled: !!isConnected && !!messageId,
  });

  return {
    message: item ?? undefined,
    isLoading,
    error: error ?? undefined,
  };
}
