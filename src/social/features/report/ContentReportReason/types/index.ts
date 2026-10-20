import type { ContentFlagReasonEnum } from '@amityco/ts-sdk-react-native';
import type { PageID } from '../../../../enums';
import type { ReportContentType } from '../../../../types';

export type ContentReportReasonProps = {
  /** What is being reported. A reply is reported as a comment. */
  contentType: ReportContentType;
  /** The postId or commentId of the reported content. */
  contentId: string;
  /** Called once the sheet has finished sliding out. Unmount it here. */
  onClose: () => void;
  /** Called after the report has been submitted successfully. */
  onReported?: () => void;
  pageId?: PageID;
};

export type ReportReasonOption = {
  value: ContentFlagReasonEnum;
  label: string;
};
