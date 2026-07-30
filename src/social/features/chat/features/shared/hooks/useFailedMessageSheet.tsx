// useFailedMessageSheet — ported from AmityUiKitWeb v4/chat/features/shared/hooks/useFailedMessageSheet.
// Presents the "message failed to send" action sheet (Resend / Delete) and wires
// the retry/discard callbacks. The return shape (UseFailedMessageSheetReturn) is
// preserved verbatim from web so useChatMessage consumes it unchanged.
//
// RN adaptation from web:
//   - Web opened a bottom Drawer holding a `Menu` (Resend / Delete). RN presents
//     the same Menu in the repo's global @devvie bottom sheet (`useBottomSheet` →
//     BottomSheetComponent) with `container="drawer"` — the identical pattern the
//     conversation user-action menu uses. NOT an Alert dialog.
//   - Non-synthetic delete/resend use the existing RN `useDeleteMessage` /
//     `useCreateMessage` mutations instead of web's query hooks (resend = recreate
//     the message, then delete the original — same as web's useResendMessageQuery).

import { StyleSheet, View } from 'react-native';

import { Menu } from '../../../../../../core/design/components/Menu';
import { useString } from '../../../../../../core/localization';
import { useBottomSheet } from '../../../../../../core/stores/slices/bottomSheetSlice';
import { useChatNotifications } from '../../../hooks/useChatNotifications';
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
  const { openBottomSheet, closeBottomSheet, bottomSheetHeight } =
    useBottomSheet();
  const { error: errorToast } = useChatNotifications();
  const { deleteMessage } = useDeleteMessage();
  // useCreateMessage maps the SDK error to localized copy but only through its
  // onError callback. Nothing passed one, so a resend that failed again was
  // completely silent — and mutateAsync's rejection went unhandled on top.
  // Web doesn't toast here either; this leads web rather than porting it.
  const { createMessage } = useCreateMessage({
    onError: (errorMsg) => errorToast({ content: errorMsg }),
  });
  const resendLabel = useString('amity_chat_message_resend');
  const deleteLabel = useString('amity_chat_option_delete');

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
    // The original is only removed once the new message is actually created —
    // deleting it on failure would drop the text the user is trying to send.
    try {
      await createMessage({
        subChannelId: message.subChannelId,
        dataType: message.dataType,
        data: message.data,
        parentId: message.parentId,
      } as Parameters<typeof createMessage>[0]);
    } catch {
      // useCreateMessage's onError already raised the toast. Swallow the
      // rejection so it isn't an unhandled promise, and leave the original
      // failed bubble in place.
      return;
    }
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
    openBottomSheet({
      height: bottomSheetHeight[2 as keyof typeof bottomSheetHeight],
      content: (
        <View style={styles.sheetContainer}>
          <Menu variant="chat" container="drawer">
            {/* Web Menu.Item default typography is BodyBold — no `typography`
                override (the earlier `body` override was the wrong button style). */}
            <Menu.Item
              label={resendLabel}
              onPress={() => {
                closeBottomSheet();
                handleResend(message);
              }}
            />
            <Menu.Item
              label={deleteLabel}
              destructive
              onPress={() => {
                closeBottomSheet();
                handleDelete(message);
              }}
            />
          </Menu>
        </View>
      ),
    });
  }

  return { openFailedSheet };
}

const styles = StyleSheet.create({
  // Web's drawer container supplies the horizontal padding (its menuItem in a
  // drawer is `0.875rem 0`, i.e. no side padding). Match the RN chat-sheet
  // convention (AmityConversationChatUserActionComponent) so the Resend/Delete
  // rows aren't flush to the screen edges.
  sheetContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
