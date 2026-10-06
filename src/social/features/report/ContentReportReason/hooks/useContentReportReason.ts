import { useEffect, useState } from 'react';
import { ContentFlagReasonEnum } from '@amityco/ts-sdk-react-native';
import { useNetworkOnline } from '../../../../../core/hooks/useNetworkOnline';
import { useToast } from '../../../../../core/stores/slices/toastSlice';
import { resolveString, useString } from '../../../../../core/localization';
import { CHARACTER_LIMIT } from '../../../../../core/constants';
import { useAmityComponent, useAmityElement } from '../../../../hooks';
import { useFlagContent } from '../../../../hooks/queries/useFlagContent';
import { ComponentID, ElementID, PageID } from '../../../../enums';
import type { ContentReportReasonProps, ReportReasonOption } from '../types';
import { useStyles } from '../styles';

// "Others" is not in this list: it is a row of its own that opens the free-text
// view instead of being selected in place.
const REPORT_REASONS: { value: ContentFlagReasonEnum; labelKey: string }[] = [
  {
    value: ContentFlagReasonEnum.CommunityGuidelines,
    labelKey: 'amity_social_label_report_reason_community_guidelines',
  },
  {
    value: ContentFlagReasonEnum.HarassmentOrBullying,
    labelKey: 'amity_social_label_report_reason_harassment_or_bullying',
  },
  {
    value: ContentFlagReasonEnum.SelfHarmOrSuicide,
    labelKey: 'amity_social_label_report_reason_self_harm_or_suicide',
  },
  {
    value: ContentFlagReasonEnum.ViolenceOrThreateningContent,
    labelKey: 'amity_social_label_report_reason_violence_or_threatening',
  },
  {
    value: ContentFlagReasonEnum.SellingRestrictedItems,
    labelKey: 'amity_social_label_report_reason_selling_restricted',
  },
  {
    value: ContentFlagReasonEnum.SexualContentOrNudity,
    labelKey: 'amity_social_label_report_reason_sexual_content_or_nudity',
  },
  {
    value: ContentFlagReasonEnum.SpamOrScams,
    labelKey: 'amity_social_label_report_reason_spam_or_scams',
  },
  {
    value: ContentFlagReasonEnum.FalseInformation,
    labelKey: 'amity_social_label_report_reason_false_information',
  },
];

export function useContentReportReason({
  contentType,
  contentId,
  onClose,
  onReported,
  pageId = PageID.WildCardPage,
}: ContentReportReasonProps) {
  const componentId = ComponentID.content_report_reason;
  const { styles, theme } = useStyles();
  const { showToast } = useToast();
  const { online } = useNetworkOnline();
  const { reportContent, isPending, isContentDeleted } = useFlagContent({
    contentType,
    contentId,
  });
  const { accessibilityId } = useAmityComponent({ pageId, componentId });
  const { accessibilityId: submitButtonId } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.submit_button,
  });
  const { accessibilityId: closeButtonId } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.close_button,
  });

  // Every way out of the sheet (the X, Close, a successful report, the
  // backdrop, a drag, Android back) ends with this flag off. The sheet slides
  // out first and calls `onClose` at the end, which is where its owner
  // unmounts it.
  const [isSheetVisible, setIsSheetVisible] = useState(true);
  const [isShowOthersOption, setIsShowOthersOption] = useState(false);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [selectedReason, setSelectedReason] = useState<ContentFlagReasonEnum>();

  const reportReasonTitle = useString('amity_social_button_report_reason');
  const othersTitle = useString('amity_social_button_others');
  const description = useString('amity_social_report_list_screen_description');
  const otherReasonTitle = useString(
    'amity_social_label_report_other_reason_desc'
  );
  const otherReasonOptional = useString(
    'amity_social_button_report_other_reason_optional'
  );
  const otherReasonPlaceholder = useString(
    'amity_social_placeholder_report_text_placeholder'
  );
  const submitText = useString('amity_social_button_report_submit_button');
  const closeText = useString('amity_social_modal_dialog_close_button');
  const unavailableTitle = useString(
    'amity_social_label_livestream_deleted_page_title'
  );
  const unavailableDescription = useString(
    'amity_social_button_livestream_unavailable_desc'
  );
  const noInternetText = useString('amity_social_label_no_internet_connection');

  const reasons: ReportReasonOption[] = REPORT_REASONS.map(
    ({ value, labelKey }) => ({ value, label: resolveString(labelKey) })
  );

  useEffect(() => {
    if (!online) showToast({ type: 'informative', message: noInternetText });
  }, [online]);

  const requestClose = () => setIsSheetVisible(false);

  const handleSheetClose = () => {
    setIsSheetVisible(false);
    onClose();
  };

  const showOthersOption = () => {
    setSelectedReason(ContentFlagReasonEnum.Others);
    setIsShowOthersOption(true);
  };

  const hideOthersOption = () => {
    setSelectedReason(undefined);
    setIsShowOthersOption(false);
  };

  // Enter may not start a new line; the text still wraps. Stripping on change
  // also catches a pasted multi-line string.
  const changeOtherReasonText = (text: string) =>
    setOtherReasonText(text.replace(/[\r\n]+/g, ''));

  const isSubmitDisabled = !selectedReason || !online || isPending;

  const submitReport = () => {
    if (isSubmitDisabled) return;

    // Others sends the free text, which may be empty since the description is
    // optional. Every other reason sends itself.
    const reason =
      selectedReason === ContentFlagReasonEnum.Others
        ? otherReasonText.trim()
        : selectedReason;

    reportContent(reason, {
      onSuccess: () => {
        onReported?.();
        requestClose();
      },
    });
  };

  return {
    styles,
    theme,
    pageId,
    componentId,
    accessibilityId,
    submitButtonId,
    closeButtonId,
    isSheetVisible,
    isShowOthersOption,
    isContentDeleted,
    isPending,
    isSubmitDisabled,
    reasons,
    selectedReason,
    otherReasonText,
    otherReasonMaxLength: CHARACTER_LIMIT.REPORT_REASON_DETAIL,
    texts: {
      title: isShowOthersOption ? othersTitle : reportReasonTitle,
      others: othersTitle,
      description,
      otherReasonTitle,
      otherReasonOptional,
      otherReasonPlaceholder,
      submit: submitText,
      close: closeText,
      unavailableTitle,
      unavailableDescription,
    },
    setSelectedReason,
    changeOtherReasonText,
    showOthersOption,
    hideOthersOption,
    requestClose,
    handleSheetClose,
    submitReport,
  };
}
