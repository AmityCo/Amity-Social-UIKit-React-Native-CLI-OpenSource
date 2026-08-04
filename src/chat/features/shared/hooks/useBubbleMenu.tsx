// useBubbleMenu — ported from AmityUiKitWeb v4/chat/features/shared/hooks/useBubbleMenu.
// Holds the message action-menu state and the per-action handlers. In RN the menu
// is long-press triggered (see components/AmityMessageActionMenu) rather than
// anchored to a DOM node, so `anchor` is kept optional and loosely typed.
//
// RN adaptations from web (return shape UseBubbleMenuReturn preserved verbatim so
// useChatMessage consumes it unchanged):
//   - Delete goes through the RN `useDeleteMessageQuery` port, which confirms via
//     the platform `Alert` before deleting (web used ConfirmProvider's modal).
//   - Copy uses `@react-native-clipboard/clipboard` (`Clipboard.setString`, sync)
//     instead of `navigator.clipboard.writeText`; the copied-success toast fires
//     through the useChatNotifications stub.
//   - Save has no RN infra yet (web's `useSaveMediaMessageQuery`) — `handleBubbleSave`
//     is a documented stub.
//   - Report: web opened a Drawer (mobile) / Popup (desktop) with ContentReportReason.
//     RN keeps the report target in local state (`reportMessage`) and the orchestrator
//     (useChatMessage) surfaces it so Chat/GroupChat render the full-screen
//     ContentReportReason Modal — the same overlay pattern as see-more (BUG: PDT-4007,
//     the report UI previously appeared as a partial bottom sheet / no-op).
//   - Reactor-list sheet has no RN component wired here (web opened a Drawer/Popup with
//     MessageReactorListSheet) — `handleOpenReactorListSheet` is a documented stub;
//     Chat/GroupChat open the reactor list via the global bottom sheet instead.

import { useState } from 'react';

import Clipboard from '@react-native-clipboard/clipboard';

import { useString } from '../../../../core/localization';
import { useDeleteMessageQuery } from '../../../hooks/queries';
import { useChatNotifications } from '../../../hooks/useChatNotifications';

type BubbleMenuState = {
  message: Amity.Message;
  anchor?: unknown;
};

type UseBubbleMenuParams = {
  onEditMessage: (message: Amity.Message) => void;
  onReplyMessage: (message: Amity.Message) => void;
  viewerIsMutedInChannel?: boolean;
};

export type UseBubbleMenuReturn = {
  bubbleMenu: BubbleMenuState | null;
  openBubbleMenu: (message: Amity.Message, anchor?: unknown) => void;
  closeBubbleMenu: () => void;
  handleBubbleDelete: () => void;
  handleBubbleEdit: () => void;
  handleBubbleReply: () => void;
  handleBubbleCopy: () => Promise<void>;
  handleBubbleSave: () => void;
  handleBubbleReport: (message: Amity.Message) => void;
  handleOpenReactorListSheet: (message: Amity.Message) => void;
  // The message pending report (drives the ContentReportReason Modal), and its closer.
  reportMessage: Amity.Message | null;
  closeReport: () => void;
  viewerIsMutedInChannel: boolean;
};

// Mirrors web's chat/utils/getClipboardPayload (inlined; no RN chat/utils dir yet).
function getClipboardPayload(message: Amity.Message): string | null {
  if (message.dataType === 'text') {
    const data = message.data as Amity.Message<'text'>['data'];
    return data?.text ?? '';
  }
  if (message.dataType === 'custom') {
    const data = (message as Amity.Message<'custom'>).data;
    if (data == null) return null;
    if (typeof data === 'string') return data;
    return JSON.stringify(data);
  }
  return null;
}

export function useBubbleMenu({
  onEditMessage,
  onReplyMessage,
  viewerIsMutedInChannel = false,
}: UseBubbleMenuParams): UseBubbleMenuReturn {
  const { success } = useChatNotifications();
  const copiedToast = useString('amity_chat_toast_copied');
  const [bubbleMenu, setBubbleMenu] = useState<BubbleMenuState | null>(null);
  const [reportMessage, setReportMessage] = useState<Amity.Message | null>(
    null
  );

  function closeBubbleMenu() {
    setBubbleMenu(null);
  }

  const { requestDelete } = useDeleteMessageQuery();

  function openBubbleMenu(message: Amity.Message, anchor?: unknown) {
    setBubbleMenu({ message, anchor });
  }

  function handleBubbleDelete() {
    if (!bubbleMenu) return;
    const message = bubbleMenu.message;
    closeBubbleMenu();
    requestDelete(message);
  }

  function handleBubbleEdit() {
    if (!bubbleMenu) return;
    const message = bubbleMenu.message;
    closeBubbleMenu();
    onEditMessage(message);
  }

  function handleBubbleReply() {
    if (!bubbleMenu) return;
    const message = bubbleMenu.message;
    closeBubbleMenu();
    onReplyMessage(message);
  }

  async function handleBubbleCopy() {
    if (!bubbleMenu) return;
    const message = bubbleMenu.message;
    closeBubbleMenu();

    const payload = getClipboardPayload(message);
    if (payload) {
      Clipboard.setString(payload);
      success({ content: copiedToast, alignment: 'with-composer' });
    }
  }

  function handleBubbleSave() {
    if (!bubbleMenu) return;
    closeBubbleMenu();
    // TODO: no RN media-save infra yet (web's useSaveMediaMessageQuery). Stubbed.
  }

  function handleBubbleReport(message: Amity.Message) {
    // Open the full-screen ContentReportReason Modal (rendered by Chat/GroupChat).
    setReportMessage(message);
  }

  function closeReport() {
    setReportMessage(null);
  }

  function handleOpenReactorListSheet(_message: Amity.Message) {
    closeBubbleMenu();
    // TODO: no RN MessageReactorListSheet yet (web opened a Drawer/Popup). Stubbed.
  }

  return {
    bubbleMenu,
    openBubbleMenu,
    closeBubbleMenu,
    handleBubbleDelete,
    handleBubbleEdit,
    handleBubbleReply,
    handleBubbleCopy,
    handleBubbleSave,
    handleBubbleReport,
    handleOpenReactorListSheet,
    reportMessage,
    closeReport,
    viewerIsMutedInChannel,
  };
}
