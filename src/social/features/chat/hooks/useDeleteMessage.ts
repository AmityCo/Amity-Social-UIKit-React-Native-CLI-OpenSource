// useDeleteMessage — ported from AmityUiKitWeb v4/chat/hooks/useDeleteMessage.
// react-query mutation over MessageRepository.deleteMessage.

import { MessageRepository } from '@amityco/ts-sdk-react-native';
import { useMutation, UseMutationResult } from '@tanstack/react-query';

import { useString } from '../../../../core/localization';

type DeleteMessageParams = Parameters<
  typeof MessageRepository.deleteMessage
>[0];
type DeleteMessageResponse = Awaited<
  ReturnType<typeof MessageRepository.deleteMessage>
>;

export const useDeleteMessage = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (errorMsg: string) => void;
} = {}): {
  deleteMessage: UseMutationResult<
    DeleteMessageResponse,
    Error,
    DeleteMessageParams
  >['mutateAsync'];
} => {
  const deleteErrorToast = useString('amity_chat_toast_delete_error');
  const { mutateAsync } = useMutation<
    DeleteMessageResponse,
    Error,
    DeleteMessageParams
  >({
    mutationFn: (params) => MessageRepository.deleteMessage(params),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: () => {
      onError?.(deleteErrorToast);
    },
  });

  return { deleteMessage: mutateAsync };
};
