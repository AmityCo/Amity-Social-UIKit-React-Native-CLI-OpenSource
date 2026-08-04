// useDeleteMessageQuery — RN port of AmityUiKitWeb
// v4/chat/hooks/queries/useDeleteMessageQuery.ts. Confirms before deleting a
// message, then runs the delete and reports failure through the chat toast.
// The return shape (`requestDelete(message, { afterDelete })`) is preserved
// verbatim from web so every call site ports unchanged.
//
// RN adaptations vs web:
//   - Confirm UI: web used `useConfirmContext()` (ConfirmProvider renders a styled
//     modal). RN has no ConfirmProvider, so this uses the platform `Alert.alert`
//     — the same confirm mechanism the rest of this repo already uses
//     (PostComposer, useUpload, useImagePicker). Web's `okButtonColor: 'alert'`
//     maps to the iOS `destructive` button style; Android has no equivalent.
//   - Strings are the same four keys web uses, so copy stays in sync.
//   - Web closed its modal explicitly (`closeConfirm`) in every branch; Alert
//     dismisses itself when a button is pressed, so there is nothing to close.

import { Alert } from 'react-native';

import { useString } from '../../../core/localization';
import { useChatNotifications } from '../useChatNotifications';
import { useDeleteMessage } from '../useDeleteMessage';

export type RequestDeleteOptions = {
  afterDelete?: () => void;
};

export type UseDeleteMessageQueryReturn = {
  requestDelete: (
    message: Amity.Message,
    options?: RequestDeleteOptions
  ) => void;
};

export function useDeleteMessageQuery(): UseDeleteMessageQueryReturn {
  const { error } = useChatNotifications();
  const deleteAlertTitle = useString('amity_chat_delete_alert_title');
  const deleteAlertMessage = useString('amity_chat_delete_alert_message');
  const deleteConfirm = useString('amity_chat_option_delete');
  const cancelLabel = useString('amity_chat_cancel');
  const { deleteMessage } = useDeleteMessage({
    onError: (errorMsg) => error({ content: errorMsg }),
  });

  function requestDelete(
    message: Amity.Message,
    options?: RequestDeleteOptions
  ) {
    const messageId = message.messageId;
    // Web bails before showing the confirm when there is no id (synthetic /
    // not-yet-synced message) — callers handle those locally.
    if (!messageId) return;

    Alert.alert(deleteAlertTitle, deleteAlertMessage, [
      { text: cancelLabel, style: 'cancel' },
      {
        text: deleteConfirm,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMessage(messageId);
            options?.afterDelete?.();
          } catch {
            // useDeleteMessage's onError already raised the toast.
          }
        },
      },
    ]);
  }

  return { requestDelete };
}
