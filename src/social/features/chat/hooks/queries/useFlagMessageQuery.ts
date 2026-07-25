// useFlagMessageQuery — RN port of AmityUiKitWeb
// v4/chat/hooks/queries/useFlagMessageQuery.ts. Answers "have I reported this
// message?" and exposes unreport, so the bubble action menu can toggle
// Report ↔ Unreport (web's MessageActionsPopover drives the same swap from this
// hook). The report action itself (with a reason) stays in the RN
// ContentReportReason modal — it calls MessageRepository.flagMessage directly and
// invalidates this query's key (see flagMessageQueryKey) so the menu refreshes.
//
// RN adaptations vs web:
//   - Toasts route through useChatNotifications (the custom chat pill) instead of
//     web's useNotifications('chat'); web uses success on success and `info` on the
//     error path, mirrored here.
//   - web's `report(reason)` + isMessageDeleted/alignment/responsive branches are
//     omitted: RN reports via the ContentReportReason modal, not this hook.

import { MessageRepository } from '@amityco/ts-sdk-react-native';
import { useMutation, useQuery } from '@tanstack/react-query';

type UnflagMessagePayload = Awaited<
  ReturnType<typeof MessageRepository.unflagMessage>
>;

import { useString } from '../../../../../core/localization';
import { useChatNotifications } from '../useChatNotifications';

// Single source of truth for the query key, shared with ContentReportReason's
// invalidation — if these drift, invalidation silently no-ops and the menu never
// flips to Unreport (indistinguishable from the bug this fixes).
export function flagMessageQueryKey(messageId: string) {
  return [
    'asc-uikit',
    'MessageRepository',
    'isMessageFlaggedByMe',
    messageId,
  ] as const;
}

export type UseFlagMessageQueryParams = {
  messageId: string;
  enabled?: boolean;
};

export type UseFlagMessageQueryReturn = {
  /** True only while the flag state is actually being fetched (react-query v5:
   *  isPending && isFetching → false when the query is disabled). Gate the
   *  Report/Unreport items on this so neither shows before the answer is known. */
  isLoading: boolean;
  isFlaggedByMe: boolean;
  isPendingUnreport: boolean;
  unreport: (options?: { onSuccess?: () => void }) => void;
  refetch: () => void;
};

export function useFlagMessageQuery({
  messageId,
  enabled = true,
}: UseFlagMessageQueryParams): UseFlagMessageQueryReturn {
  const { success, info } = useChatNotifications();
  const unreportSuccessToast = useString('amity_chat_toast_un_report_message');
  const unreportErrorToast = useString(
    'amity_chat_toast_un_report_message_error'
  );

  const {
    data: isFlaggedByMe,
    isLoading,
    refetch,
  } = useQuery<boolean>({
    queryKey: flagMessageQueryKey(messageId),
    queryFn: () => MessageRepository.isMessageFlaggedByMe(messageId),
    enabled: enabled && !!messageId,
    // Re-fetch whenever the menu re-enables this query (default staleTime 0), so
    // reopening the menu after a report reflects the new flag state on its own —
    // invalidation from the report screen is reinforcement, not the sole path.
  });

  const { mutate: unflagMessageMutate, isPending: isPendingUnreport } =
    useMutation<UnflagMessagePayload, Error, string>({
      mutationFn: (id) => MessageRepository.unflagMessage(id),
      onSuccess: () => {
        refetch();
        success({ content: unreportSuccessToast });
      },
      onError: () => {
        info({ content: unreportErrorToast });
      },
    });

  function unreport(options: { onSuccess?: () => void } = {}) {
    if (!messageId) return;
    unflagMessageMutate(messageId, {
      onSuccess: () => options.onSuccess?.(),
    });
  }

  return {
    isLoading,
    isFlaggedByMe: isFlaggedByMe ?? false,
    isPendingUnreport,
    unreport,
    refetch: () => {
      refetch();
    },
  };
}
