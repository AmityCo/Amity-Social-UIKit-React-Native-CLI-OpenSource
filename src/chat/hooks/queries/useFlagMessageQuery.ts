// useFlagMessageQuery — RN port of AmityUiKitWeb
// v4/chat/hooks/queries/useFlagMessageQuery.ts. Answers "have I reported this
// message?" and owns both directions of the toggle, so the bubble action menu can
// swap Report ↔ Unreport (web's MessageActionsPopover drives the same swap from
// this hook) and the ContentReportReason sheet can submit through it.
//
// RN adaptations vs web:
//   - Toasts route through useChatNotifications (the custom chat pill) instead of
//     web's useNotifications('chat'). Web raises `info` on every error path; RN
//     keeps each direction on the variant it already shipped with — report errors
//     as `error` ('failed' pill, what the report screen raised before this hook
//     owned it) and unreport errors as `info`, which is the behaviour PDT-5230
//     cites as already correct. Worth unifying once design rules on the pill.
//   - web's toastAlignment/responsive branches are omitted — RN has one alignment.

import { useState } from 'react';
import { MessageRepository } from '@amityco/ts-sdk-react-native';
import { useMutation, useQuery } from '@tanstack/react-query';

type FlagMessagePayload = Awaited<
  ReturnType<typeof MessageRepository.flagMessage>
>;

type UnflagMessagePayload = Awaited<
  ReturnType<typeof MessageRepository.unflagMessage>
>;

import { useString } from '../../../core/localization';
import { ERROR_CODE } from '../../constants';
import { useChatNotifications } from '../useChatNotifications';

// Single source of truth for the query key, shared with any external
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

export type ReportOptions = {
  reason?: Amity.ContentFlagReason;
  onSuccess?: () => void;
};

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
  /** Set once a report comes back NOT_FOUND (400400) — the message was deleted
   *  while the report sheet was open. Drives the sheet's "Something went wrong"
   *  state instead of a toast (PDT-5229). Report-only: unreport is driven from the
   *  bubble menu, which has no surface for this state. */
  isMessageDeleted: boolean;
  isPendingReport: boolean;
  isPendingUnreport: boolean;
  report: (options?: ReportOptions) => void;
  unreport: (options?: { onSuccess?: () => void }) => void;
  refetch: () => void;
};

export function useFlagMessageQuery({
  messageId,
  enabled = true,
}: UseFlagMessageQueryParams): UseFlagMessageQueryReturn {
  const { success, info, error } = useChatNotifications();
  const [isMessageDeleted, setIsMessageDeleted] = useState(false);
  const reportSuccessToast = useString('amity_chat_toast_message_reported');
  const reportErrorToast = useString('amity_chat_toast_message_reported_error');
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
    // reopening the menu after a report reflects the new flag state on its own.
  });

  const { mutate: flagMessageMutate, isPending: isPendingReport } = useMutation<
    FlagMessagePayload,
    Error,
    Parameters<typeof MessageRepository.flagMessage>
  >({
    mutationFn: (args) => MessageRepository.flagMessage(...args),
    onSuccess: () => {
      refetch();
      success({ content: reportSuccessToast });
    },
    onError: (err) => {
      // A message deleted while the sheet was open answers 400400. That is a
      // state, not a toast — the sheet swaps to "Something went wrong".
      if (err.message?.includes(ERROR_CODE.NOT_FOUND)) {
        setIsMessageDeleted(true);
        return;
      }
      error({ content: reportErrorToast });
    },
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

  async function report(options: ReportOptions = {}) {
    if (!messageId) return;
    const { reason, onSuccess } = options;

    // PDT-5230: the same user reporting the same message twice (two devices, or a
    // stale cache) must fail like the duplicate *unreport* already does. The SDK
    // does not reject the second flagMessage, so the duplicate is caught here
    // instead — and deliberately from a *fresh* read, because the cached answer
    // predates whatever the other device did.
    const { data: alreadyFlagged } = await refetch();
    if (alreadyFlagged) {
      error({ content: reportErrorToast });
      return;
    }

    flagMessageMutate([messageId, reason], {
      onSuccess: () => onSuccess?.(),
    });
  }

  function unreport(options: { onSuccess?: () => void } = {}) {
    if (!messageId) return;
    unflagMessageMutate(messageId, {
      onSuccess: () => options.onSuccess?.(),
    });
  }

  return {
    isLoading,
    isFlaggedByMe: isFlaggedByMe ?? false,
    isMessageDeleted,
    isPendingReport,
    isPendingUnreport,
    report,
    unreport,
    refetch: () => {
      refetch();
    },
  };
}
