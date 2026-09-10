// useChannelArchiveQuery — ported from AmityUiKitWeb
// v4/chat/hooks/queries/useChannelArchiveQuery.
// react-query mutations over ChannelRepository.archiveChannel / unarchiveChannel.
//
// RN adaptations from web:
//   - Web `useNotifications('chat').success/error` → the redux toast (`useToast`).
//   - Web `useConfirmContext().info` archive-limit dialog → RN `Alert.alert`
//     (RN has no in-app ConfirmProvider; mirrors the pattern used by
//     useSelectGroupMember / useGroupSetting).

import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { useString } from '../../../core/localization';
import { useToast } from '../../../core/stores/slices/toastSlice';

type Params = Parameters<typeof ChannelRepository.archiveChannel>;

export type ChannelArchivePayload = {
  channelId: Params[0];
};

type Response = Awaited<ReturnType<typeof ChannelRepository.archiveChannel>>;

export function useChannelArchiveQuery() {
  const { showToast } = useToast();
  const archiveLimitTitle = useString('amity_chat_archive_limit_title');
  const archiveLimitMessage = useString('amity_chat_archive_limit_message');
  const okLabel = useString('amity_chat_button_ok');
  const archiveErrorToast = useString('amity_chat_archive_error_toast');
  const unarchiveErrorToast = useString('amity_chat_unarchive_error_toast');
  const archivedSuccessToast = useString('amity_chat_archived_toast');
  const unarchiveSuccessToast = useString('amity_chat_unarchived_toast');

  const archiveMutation = useMutation<Response, Error, ChannelArchivePayload>({
    mutationFn: ({ channelId }) => ChannelRepository.archiveChannel(channelId),
    // PDT-4038: react-query PAUSES a mutation while offline instead of running it,
    // so archiving with no connection silently queued and neither toast fired —
    // then the queued call succeeded on reconnect and showed "Chat archived",
    // which is the opposite of what QA expects. 'always' makes it run and fail now.
    networkMode: 'always',
    onSuccess: () => {
      showToast({
        message: archivedSuccessToast,
        type: 'success',
        variant: 'custom',
      });
    },
    onError: (err) => {
      if (err.message?.includes('Archive limit exceeded')) {
        Alert.alert(archiveLimitTitle, archiveLimitMessage, [
          { text: okLabel },
        ]);
        return;
      }
      showToast({
        message: archiveErrorToast,
        type: 'failed',
        variant: 'custom',
      });
    },
  });

  const unarchiveMutation = useMutation<Response, Error, ChannelArchivePayload>(
    {
      mutationFn: ({ channelId }) =>
        ChannelRepository.unarchiveChannel(channelId),
      // PDT-4038: see the archive mutation above.
      networkMode: 'always',
      onSuccess: () => {
        showToast({
          message: unarchiveSuccessToast,
          type: 'success',
          variant: 'custom',
        });
      },
      onError: () => {
        showToast({
          message: unarchiveErrorToast,
          type: 'failed',
          variant: 'custom',
        });
      },
    }
  );

  async function archiveChannel(payload: ChannelArchivePayload): Promise<void> {
    await archiveMutation.mutateAsync(payload);
  }

  async function unarchiveChannel(
    payload: ChannelArchivePayload
  ): Promise<void> {
    await unarchiveMutation.mutateAsync(payload);
  }

  return { archiveChannel, unarchiveChannel };
}
