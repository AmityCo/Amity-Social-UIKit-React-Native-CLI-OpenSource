// useCreateMessage — ported from AmityUiKitWeb v4/chat/hooks/useCreateMessage.
// react-query mutation over MessageRepository.createMessage. The RN
// AmityUIKitProvider already wraps children in a QueryClientProvider, so
// useMutation works out of the box. On failure it maps known SDK error
// substrings to a localized toast message via resolveString.

import { MessageRepository } from '@amityco/ts-sdk-react-native';
import { useMutation, UseMutationResult } from '@tanstack/react-query';

import { resolveString } from '../../../../core/localization';
import { ERROR_RESPONSE } from '../constants';

type CreateMessageParams = Parameters<
  typeof MessageRepository.createMessage
>[0];
type CreateMessageResponse = Awaited<
  ReturnType<typeof MessageRepository.createMessage>
>;

export const useCreateMessage = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (errorMsg: string) => void;
} = {}): {
  createMessage: UseMutationResult<
    CreateMessageResponse,
    Error,
    CreateMessageParams
  >['mutateAsync'];
  error: Error | null;
} => {
  const { mutateAsync, error } = useMutation<
    CreateMessageResponse,
    Error,
    CreateMessageParams
  >({
    mutationFn: (params) => MessageRepository.createMessage(params),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (err) => {
      const { message } = err;
      let notificationMessage = resolveString(
        'amity_common_label_message_not_sent'
      );

      // PDT-4160: use the chat keys, not the social twins. The social strings
      // carry the old "…contained a blocked word" wording and are shared with
      // the social module, so they can't be reworded from a chat ticket — and
      // this hook is chat-only (useFailedMessageSheet's resend path), so a
      // resend failure would otherwise show different copy than the composer.
      if (message.includes(ERROR_RESPONSE.CONTAIN_BLOCKED_WORD)) {
        notificationMessage = resolveString('amity_chat_toast_banned_word');
      } else if (message.includes(ERROR_RESPONSE.NOT_INCLUDE_WHITELIST_LINK)) {
        notificationMessage = resolveString('amity_chat_toast_link_not_allow');
      } else if (message.includes(ERROR_RESPONSE.USER_MUTED)) {
        notificationMessage = resolveString('amity_social_button_user_muted');
      }

      onError?.(notificationMessage);
    },
  });

  return { createMessage: mutateAsync, error };
};
