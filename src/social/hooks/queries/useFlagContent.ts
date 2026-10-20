import { useState } from 'react';
import {
  CommentRepository,
  PostRepository,
} from '@amityco/ts-sdk-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../core/stores/slices/toastSlice';
import { useString } from '../../../core/localization';
import { ERROR_CODE } from '../../../core/constants';
import { ReportContentType } from '../../types';
import { flagPostQueryKey } from './useFlagPost';

type FlagContentPayload = Awaited<ReturnType<typeof PostRepository.flagPost>>;

type FlagContentParam = Parameters<typeof PostRepository.flagPost>[1];

type UseFlagContent = {
  contentType: ReportContentType;
  contentId: string;
};

const REPORTED_TOAST_KEY: Record<ReportContentType, string> = {
  [ReportContentType.post]: 'amity_social_button_post_reported',
  [ReportContentType.comment]:
    'amity_social_toast_comment_reported_toast_message',
  [ReportContentType.reply]: 'amity_social_toast_reply_reported_toast_message',
};

const REPORT_FAILED_TOAST_KEY: Record<ReportContentType, string> = {
  [ReportContentType.post]: 'amity_social_toast_post_report_failed',
  [ReportContentType.comment]: 'amity_social_comment_report_failed',
  [ReportContentType.reply]: 'amity_social_reply_report_failed',
};

export const useFlagContent = ({ contentType, contentId }: UseFlagContent) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isContentDeleted, setIsContentDeleted] = useState(false);
  const reportedText = useString(REPORTED_TOAST_KEY[contentType]);
  const reportFailedText = useString(REPORT_FAILED_TOAST_KEY[contentType]);

  const { mutate: flagContentMutate, isPending } = useMutation<
    FlagContentPayload,
    Error,
    FlagContentParam
  >({
    mutationFn: (reason) =>
      contentType === ReportContentType.post
        ? PostRepository.flagPost(contentId, reason)
        : CommentRepository.flagComment(contentId, reason),
    onSuccess: () => {
      if (contentType !== ReportContentType.post) return;
      // The post menu reads this flag state to swap to "Unreport post".
      queryClient.setQueryData(flagPostQueryKey(contentId), true);
      queryClient.invalidateQueries({ queryKey: flagPostQueryKey(contentId) });
    },
  });

  const reportContent = (
    reason: FlagContentParam,
    options?: { onSuccess?: () => void }
  ) => {
    flagContentMutate(reason, {
      onSuccess: () => {
        showToast({ type: 'success', message: reportedText });
        options?.onSuccess?.();
      },
      onError: (error) => {
        // The content was deleted while the sheet was open. That is a state for
        // the sheet to show, not a toast.
        if (error?.message?.includes(ERROR_CODE.ITEM_NOT_FOUND)) {
          setIsContentDeleted(true);
          return;
        }
        showToast({ type: 'informative', message: reportFailedText });
      },
    });
  };

  return {
    reportContent,
    isPending,
    isContentDeleted,
  };
};
