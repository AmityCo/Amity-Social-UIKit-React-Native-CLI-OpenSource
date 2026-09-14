// useChannelMessagePreview — resolves the message preview AmityChatListItem
// should render, keeping it correct after the previewed message is deleted.
//
// `channel.messagePreview` is a snapshot of the SDK's channel-level message
// preview cache, and that cache entry is only rewritten when a *newer* preview
// arrives. Deleting the newest message therefore leaves the row showing the
// deleted message's text: with `isIncludeDeleted: false` the replacement preview
// (the message sent before it) is older and gets skipped, and when nothing is
// left there is no replacement preview to send at all.
//
// So the row resolves the preview itself:
//   1. a single shared listener on the SDK's message events records which
//      message ids have been deleted (MQTT chat topics are auto-subscribed by
//      the SDK, so no per-row subscription or extra request is needed);
//   2. `isIncludeDeleted: true` → the preview is flagged deleted, so the row
//      renders `amity_chat_preview_deleted`;
//   3. `isIncludeDeleted: false` → the newest remaining (non-deleted) message of
//      the channel's default sub-channel replaces it, or the preview is dropped
//      so the row renders `amity_chat_preview_no_message`.
//
// While the network setting is still loading the preview is treated as
// include-deleted: showing "this message was deleted" is always preferable to
// showing the deleted text.

// 1. React / RN imports
import { useCallback, useEffect, useMemo, useState } from 'react';

// 2. Third-party imports
import { MessageRepository } from '@amityco/ts-sdk-react-native';

// 3. Internal imports (relative)
import useAuth from '../../../../core/hooks/useAuth';
import { useMessagesCollection } from '../../../hooks/collections/useMessagesCollection';
import { useMessagePreviewSetting } from '../../../hooks/useMessagePreviewSetting';

// --- Shared deleted-message registry ----------------------------------------
// One SDK subscription for the whole list rather than one per row.

const deletedMessageIds = new Set<string>();
const registryListeners = new Set<() => void>();
let disposeRegistry: (() => void) | undefined;

function recordDeletedMessage(message: Amity.InternalMessage) {
  if (!message.isDeleted || deletedMessageIds.has(message.messageId)) return;
  deletedMessageIds.add(message.messageId);
  registryListeners.forEach((listener) => listener());
}

function subscribeDeletedMessages(listener: () => void) {
  registryListeners.add(listener);

  if (!disposeRegistry) {
    // A soft delete reaches the client as either event depending on origin.
    const disposers = [
      MessageRepository.onMessageDeleted(recordDeletedMessage),
      MessageRepository.onMessageUpdated(recordDeletedMessage),
    ];
    disposeRegistry = () => disposers.forEach((dispose) => dispose());
  }

  return () => {
    registryListeners.delete(listener);
    if (registryListeners.size === 0) {
      disposeRegistry?.();
      disposeRegistry = undefined;
    }
  };
}

// --- Hook -------------------------------------------------------------------

const REPLACEMENT_PREVIEW_LIMIT = 1;

function toMessagePreview(
  channel: Amity.Channel,
  message: Amity.Message
): NonNullable<Amity.Channel['messagePreview']> {
  return {
    messagePreviewId: message.messageId,
    subChannelName: channel.displayName ?? '',
    channelId: message.channelId,
    subChannelId: message.subChannelId,
    segment: message.channelSegment,
    subChannelUpdatedAt: message.updatedAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    dataType: message.dataType,
    data: message.data,
    isDeleted: false,
    user: message.creator,
  };
}

export function useChannelMessagePreview(
  channel: Amity.Channel
): Amity.Channel['messagePreview'] {
  const preview = channel.messagePreview;
  const previewMessageId = preview?.messagePreviewId;
  const { isIncludeDeleted } = useMessagePreviewSetting();

  // The SDK's event subscribers need a connected client.
  const { isConnected } = useAuth();

  const [deletedRevision, setDeletedRevision] = useState(0);
  const bumpRevision = useCallback(() => {
    setDeletedRevision((revision) => revision + 1);
  }, []);

  useEffect(() => {
    if (!isConnected) return undefined;
    return subscribeDeletedMessages(bumpRevision);
  }, [isConnected, bumpRevision]);

  const isPreviewDeleted = useMemo(
    () =>
      Boolean(
        preview &&
          (preview.isDeleted ||
            (previewMessageId && deletedMessageIds.has(previewMessageId)))
      ),
    // `deletedRevision` re-runs the Set lookup when the registry changes.
    [preview, previewMessageId, deletedRevision]
  );

  // Only mounted for a row whose preview actually needs replacing.
  const needsReplacement = isPreviewDeleted && isIncludeDeleted === false;
  const { messages } = useMessagesCollection(
    {
      subChannelId: channel.defaultSubChannelId ?? '',
      sortBy: 'segmentDesc',
      includeDeleted: false,
      limit: REPLACEMENT_PREVIEW_LIMIT,
    },
    needsReplacement
  );

  return useMemo(() => {
    if (!preview || !isPreviewDeleted) return preview;

    if (needsReplacement) {
      const latestMessage = messages[0];
      return latestMessage ? toMessagePreview(channel, latestMessage) : null;
    }

    return preview.isDeleted ? preview : { ...preview, isDeleted: true };
  }, [preview, isPreviewDeleted, needsReplacement, messages, channel]);
}
