// useEditMessage — RN addition (web edits inline in useChat). react-query
// mutation over MessageRepository.editMessage(messageId, patch). Used by the
// message action menu's Edit flow.

import { MessageRepository } from '@amityco/ts-sdk-react-native';
import { useMutation, UseMutationResult } from '@tanstack/react-query';

import { resolveString } from '../../../../core/localization';

type EditMessageParams = {
  messageId: Parameters<typeof MessageRepository.editMessage>[0];
  patch: Parameters<typeof MessageRepository.editMessage>[1];
};
type EditMessageResponse = Awaited<
  ReturnType<typeof MessageRepository.editMessage>
>;

export const useEditMessage = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (errorMsg: string) => void;
} = {}): {
  editMessage: UseMutationResult<
    EditMessageResponse,
    Error,
    EditMessageParams
  >['mutateAsync'];
} => {
  const { mutateAsync } = useMutation<
    EditMessageResponse,
    Error,
    EditMessageParams
  >({
    mutationFn: ({ messageId, patch }) =>
      MessageRepository.editMessage(messageId, patch),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: () => {
      onError?.(resolveString('amity_common_label_message_not_sent'));
    },
  });

  return { editMessage: mutateAsync };
};
