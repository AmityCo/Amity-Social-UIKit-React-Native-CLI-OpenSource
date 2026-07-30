// ContentReportReason — ported from AmityUiKitWeb
// core/design/components/ContentReportReason/ContentReportReason.tsx, scoped to the
// message-report flow (web's component also handled post/comment; RN only needs
// message here). Web rendered it inside a Drawer (mobile) / Popup (desktop); the RN
// bug being fixed was that the report UI appeared as a partial bottom sheet, so this
// is a full-screen Modal — matching the sibling MessageFullTextScreen overlay pattern
// and how every other chat overlay is threaded through useChatMessage.
//
// RN adaptations vs web:
//   - web's `useFlagMessageQuery` (react-query) is inlined here as a direct
//     `MessageRepository.flagMessage(messageId, reason)` call — RN has no react-query
//     wrapper for messages and the report screen only reports (never toggles/unreports).
//   - web's deleted/error branch (`FailedToShow` + a Close button on NOT_FOUND /
//     400400) is dropped — RN has no `FailedToShow`; failures surface as an error
//     toast instead (documented deviation).
//   - web's offline info-toast `useEffect` is dropped; the Submit button already
//     stays disabled while offline (documented deviation).

// 1. React / RN imports
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

// 2. Third-party imports
import {
  ContentFlagReasonEnum,
  MessageRepository,
} from '@amityco/ts-sdk-react-native';
import { useQueryClient } from '@tanstack/react-query';

// 3. Internal imports
import { Typography } from '../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { Selection } from '../../../../../../../core/design/atoms/Selection';
import { Input } from '../../../../../../../core/design/atoms/Input';
import { Button } from '../../../../../../../core/design/atoms/Button';
import {
  resolveString,
  useString,
} from '../../../../../../../core/localization';
import { useChatNotifications } from '../../../../hooks/useChatNotifications';
import { flagMessageQueryKey } from '../../../../hooks/queries';
import { useNetworkOnline } from '../../../../hooks/useNetworkOnline';
import Toast from '../../../../../../components/Toast';
import { useStyles } from './styles';

// 4. Types
type ContentReportReasonProps = {
  visible: boolean;
  message: Amity.Message;
  onClose: () => void;
};

const MAX_LENGTH_DESCRIBE = 300;

// Mirrors web's `reportReasons` memo. The trailing "Others" entry is rendered as a
// separate row with a chevron (it opens the free-text sub-view), not as a radio.
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

// 5. Named function component
export function ContentReportReason({
  visible,
  message,
  onClose,
}: ContentReportReasonProps) {
  const { styles } = useStyles();
  const { success, error } = useChatNotifications();
  const queryClient = useQueryClient();
  const { online } = useNetworkOnline();

  const [isShowOthersOption, setIsShowOthersOption] = useState(false);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [selectedReason, setSelectedReason] = useState<
    Amity.ContentFlagReason | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const othersTitle = useString('amity_social_button_others');
  const reportReasonTitle = useString('amity_social_button_report_reason');
  const reportOtherReasonDesc = useString(
    'amity_social_label_report_other_reason_desc'
  );
  const reportOtherReasonOptional = useString(
    'amity_social_button_report_other_reason_optional'
  );
  const reportTextPlaceholder = useString(
    'amity_social_placeholder_report_text_placeholder'
  );
  const reportListDescription = useString(
    'amity_social_report_list_screen_description'
  );
  const closeButtonText = useString('amity_social_modal_dialog_close_button');
  const submitButtonText = useString(
    'amity_social_button_report_submit_button'
  );
  const reportSuccessToast = useString('amity_chat_toast_message_reported');
  const reportErrorToast = useString('amity_chat_toast_message_reported_error');

  const isDisabledSubmitButton = !selectedReason || !online || isSubmitting;

  function handleBack() {
    // Web resets both the selected reason and the sub-view flag.
    setSelectedReason(undefined);
    setIsShowOthersOption(false);
  }

  function handleRadioChange(value: ContentFlagReasonEnum) {
    setSelectedReason(value);
  }

  async function handleSubmitReport() {
    if (!message.messageId || !selectedReason || isSubmitting) return;

    // Web sends the free text for Others, the enum value otherwise.
    const reason =
      selectedReason === ContentFlagReasonEnum.Others
        ? otherReasonText
        : selectedReason;

    setIsSubmitting(true);
    try {
      await MessageRepository.flagMessage(message.messageId, reason);
      // Refresh the bubble menu's flag state so Report flips to Unreport
      // (reinforces the menu's own refetch-on-open; see useFlagMessageQuery).
      queryClient.invalidateQueries({
        queryKey: flagMessageQueryKey(message.messageId),
      });
      success({ content: reportSuccessToast });
      onClose();
    } catch {
      error({ content: reportErrorToast });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={[styles.headerSlot, styles.headerSlotLeft]}>
            {isShowOthersOption ? (
              <Pressable
                style={styles.iconButton}
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <AmityIcon
                  name="chevron-left"
                  size={24}
                  tokenColor={
                    AmityColorToken.IconIconButtonGhostSecondaryDefault
                  }
                />
              </Pressable>
            ) : null}
          </View>
          <View style={[styles.headerSlot, styles.headerSlotCenter]}>
            <Typography
              variant="titleBold"
              style={styles.title}
              numberOfLines={1}
            >
              {isShowOthersOption ? othersTitle : reportReasonTitle}
            </Typography>
          </View>
          <View style={[styles.headerSlot, styles.headerSlotRight]}>
            {isShowOthersOption ? (
              <Pressable
                style={styles.iconButton}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={closeButtonText}
              >
                <AmityIcon
                  name="cross-l"
                  size={24}
                  tokenColor={
                    AmityColorToken.IconIconButtonGhostSecondaryDefault
                  }
                />
              </Pressable>
            ) : null}
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {isShowOthersOption ? (
            <View style={styles.othersField}>
              <Input.Text
                title={reportOtherReasonDesc}
                optionalLabel={reportOtherReasonOptional}
                showCharacterCount
                maxLength={MAX_LENGTH_DESCRIBE}
                placeholder={reportTextPlaceholder}
                value={otherReasonText}
                onChange={setOtherReasonText}
                // PDT-4142: without this the field stays single-line, so a reason
                // typed up to MAX_LENGTH_DESCRIBE scrolls sideways on one line
                // instead of wrapping. multiLine also switches the row to
                // top-aligned so the label sits level with the first line.
                multiLine
              />
            </View>
          ) : (
            <>
              <Typography variant="caption" style={styles.description}>
                {reportListDescription}
              </Typography>
              {REPORT_REASONS.map((reason) => (
                <View key={reason.value} style={styles.rowSurface}>
                  <Selection.Radio
                    isSelected={selectedReason === reason.value}
                    onSelect={() => handleRadioChange(reason.value)}
                    accessibilityLabel={resolveString(reason.labelKey)}
                  >
                    <Typography variant="bodyBold" style={styles.option}>
                      {resolveString(reason.labelKey)}
                    </Typography>
                  </Selection.Radio>
                </View>
              ))}
              <Pressable
                style={styles.row}
                onPress={() => {
                  setSelectedReason(ContentFlagReasonEnum.Others);
                  setIsShowOthersOption(true);
                }}
                accessibilityRole="button"
                accessibilityLabel={othersTitle}
              >
                <Typography variant="bodyBold" style={styles.option}>
                  {othersTitle}
                </Typography>
                <AmityIcon
                  name="chevron-right"
                  size={24}
                  tokenColor={AmityColorToken.IconListLeadingDefaultDefault}
                />
              </Pressable>
            </>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            hierarchy="primary"
            size="lg"
            fullWidth
            label={submitButtonText}
            disabled={isDisabledSubmitButton}
            onPress={handleSubmitReport}
          />
        </View>
        {/* The global <Toast /> is mounted outside this Modal, so RN renders it
            beneath the native Modal layer. Mount a Toast inside the Modal too so
            the report-error toast (Modal stays open on failure) is visible; it
            reads the same redux toast state via context. */}
        <Toast />
      </View>
    </Modal>
  );
}
