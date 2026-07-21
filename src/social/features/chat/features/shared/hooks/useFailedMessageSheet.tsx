// useFailedMessageSheet — ported from AmityUiKitWeb v4/chat/features/shared/hooks/useFailedMessageSheet.
// Presents the "message failed to send" action sheet (Resend / Delete) and wires
// the retry/discard callbacks. The return shape (UseFailedMessageSheetReturn) is
// preserved verbatim from web so useChatMessage consumes it unchanged.
//
// RN adaptations from web:
//   - Web opened a bottom Drawer holding a Menu (Resend / Delete). RN has no
//     DrawerProvider, so the sheet is presented with the native `Alert.alert`
//     action buttons — same two choices, no new provider.
//   - Non-synthetic delete/resend use the existing RN `useDeleteMessage` /
//     `useCreateMessage` mutations instead of web's query hooks (resend = recreate
//     the message, then delete the original — same as web's useResendMessageQuery).

import { Alert } from 'react-native';

import { useString } from '../../../../../../core/localization';
import { useDeleteMessage } from '../../../hooks/useDeleteMessage';
import { useCreateMessage } from '../../../hooks/useCreateMessage';
import { isSyntheticPendingMessage } from './useMessageComposer';

type UseFailedMessageSheetParams = {
  onRetryUpload: (clientId: string) => void;
  onDiscardUpload: (clientId: string) => void;
  onRetryText: (clientId: string) => void;
  onDiscardText: (clientId: string) => void;
};

export type UseFailedMessageSheetReturn = {
  openFailedSheet: (message: Amity.Message) => void;
};

export function useFailedMessageSheet({
  onRetryUpload,
  onDiscardUpload,
  onRetryText,
  onDiscardText,
}: UseFailedMessageSheetParams): UseFailedMessageSheetReturn {
  const { deleteMessage } = useDeleteMessage();
  const { createMessage } = useCreateMessage();
  const resendLabel = useString('amity_chat_message_resend');
  const deleteLabel = useString('amity_chat_option_delete');
  const cancelLabel = useString('amity_chat_cancel');

  async function handleResend(message: Amity.Message) {
    if (isSyntheticPendingMessage(message)) {
      if (message.dataType === 'text') {
        onRetryText(message.__syntheticClientId);
      } else {
        onRetryUpload(message.__syntheticClientId);
      }
      return;
    }
    // Non-synthetic resend: recreate then delete the original (web's requestResend).
    await createMessage({
      subChannelId: message.subChannelId,
      dataType: message.dataType,
      data: message.data,
      parentId: message.parentId,
    } as Parameters<typeof createMessage>[0]);
    if (message.messageId) {
      await deleteMessage(message.messageId);
    }
  }

  function handleDelete(message: Amity.Message) {
    if (isSyntheticPendingMessage(message)) {
      if (message.dataType === 'text') {
        onDiscardText(message.__syntheticClientId);
      } else {
        onDiscardUpload(message.__syntheticClientId);
      }
      return;
    }
    if (message.messageId) {
      deleteMessage(message.messageId);
    }
  }

  function openFailedSheet(message: Amity.Message) {
    Alert.alert(undefined, undefined, [
      { text: resendLabel, onPress: () => handleResend(message) },
      {
        text: deleteLabel,
        style: 'destructive',
        onPress: () => handleDelete(message),
      },
      { text: cancelLabel, style: 'cancel' },
    ]);
  }

  return { openFailedSheet };
}
