// ContentReportReason — ported from AmityUiKitWeb
// core/design/components/ContentReportReason/ContentReportReason.tsx, scoped to the
// message-report flow (web's component also handled post/comment; RN only needs
// message here). Web renders it in a Drawer (mobile) / Popup (desktop); RN matches
// the mobile side with a bottom sheet at 90% of the viewport, per Figma
// (PDT-5225 / PDT-5261).
//
// An earlier fix took this the other way — a partial sheet was reported as a bug and
// the screen became a full-screen Modal, which then lost the drag handle, the
// backdrop and tap-outside-to-close along with it. The sheet was never the problem;
// its height was.
//
// RN adaptations vs web:
//   - reporting goes through RN's own `useFlagMessageQuery().report`, the port of
//     web's hook of the same name, so report and unreport share one code path and
//     one flag-state cache.
//   - web's offline info-toast `useEffect` is dropped; the Submit button already
//     stays disabled while offline (documented deviation).

// 1. React / RN imports
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

// 2. Third-party imports
import { ContentFlagReasonEnum } from '@amityco/ts-sdk-react-native';
import BottomSheet, { type BottomSheetMethods } from '@devvie/bottom-sheet';

// 3. Internal imports
import { Typography } from '../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { Selection } from '../../../../../core/design/atoms/Selection';
import { Input } from '../../../../../core/design/atoms/Input';
import { Button } from '../../../../../core/design/atoms/Button';
import { resolveString, useString } from '../../../../../core/localization';
import { useFlagMessageQuery } from '../../../../hooks/queries';
import { useNetworkOnline } from '../../../../hooks/useNetworkOnline';
import { FailedToShow } from '../FailedToShow';
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
  const sheetRef = useRef<BottomSheetMethods>(null);
  const { online } = useNetworkOnline();
  const { report, isMessageDeleted, isPendingReport } = useFlagMessageQuery({
    messageId: message.messageId,
    // Only subscribe while the sheet is up; the bubble menu owns its own instance.
    enabled: visible && !!message.messageId,
  });

  const [isShowOthersOption, setIsShowOthersOption] = useState(false);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [selectedReason, setSelectedReason] = useState<
    Amity.ContentFlagReason | undefined
  >(undefined);

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
  // FailedToShow's own defaults are the livestream pair — right words, wrong
  // key for anyone overriding copy, since editing the report screen's title
  // would move the livestream one with it. Pass chat's own keys for both lines.
  const messageUnavailableTitle = useString(
    'amity_chat_report_message_unavailable_title'
  );
  const messageUnavailableDesc = useString(
    'amity_chat_report_message_unavailable_desc'
  );

  // Tapping the "Others" row selects the reason before a single character is
  // typed, so `selectedReason` on its own leaves Submit live over an empty
  // free-text field — and submitting then sends '' as the reason.
  const isOthersReasonBlank =
    selectedReason === ContentFlagReasonEnum.Others && !otherReasonText.trim();

  const isDisabledSubmitButton =
    !selectedReason || isOthersReasonBlank || !online || isPendingReport;

  // The sheet animates itself open/closed; `visible` is the source of truth.
  useEffect(() => {
    if (visible) sheetRef.current?.open();
    else sheetRef.current?.close();
  }, [visible]);

  function handleBack() {
    // Web resets both the selected reason and the sub-view flag.
    setSelectedReason(undefined);
    setIsShowOthersOption(false);
  }

  function handleRadioChange(value: ContentFlagReasonEnum) {
    setSelectedReason(value);
  }

  function handleSubmitReport() {
    if (!message.messageId || isDisabledSubmitButton) return;

    // Web sends the free text for Others, the enum value otherwise.
    const reason =
      selectedReason === ContentFlagReasonEnum.Others
        ? otherReasonText.trim()
        : selectedReason;

    // The hook owns the toasts, the duplicate-report guard, the NOT_FOUND →
    // isMessageDeleted swap, and refreshing the flag state the bubble menu reads.
    report({ reason, onSuccess: onClose });
  }

  return (
    <BottomSheet
      ref={sheetRef}
      // 90% of the viewport, per Figma — a full-height sheet, not a full screen.
      height="90%"
      closeOnDragDown
      closeOnBackdropPress
      // The body scrolls; without this the sheet swallows the ScrollView's pans.
      disableBodyPanning
      onClose={onClose}
      style={styles.sheet}
    >
      <View style={styles.screen}>
        {isMessageDeleted ? (
          // PDT-5229: the message was deleted out from under this sheet.
          // Replace the body with the settled error state — what web does on
          // NOT_FOUND — rather than leaving the form up behind a toast.
          <FailedToShow
            style={styles.failed}
            title={messageUnavailableTitle}
            description={messageUnavailableDesc}
          />
        ) : (
          <>
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
                    // multiLine is what lets a reason typed up to
                    // MAX_LENGTH_DESCRIBE wrap instead of scrolling sideways, and it
                    // top-aligns the row so the label sits level with the first line.
                    // Web passes it too (an earlier note here claimed otherwise —
                    // that was true of PDT-4142's snapshot, not of current web).
                    // blockNewLine then refuses Enter without giving the wrap up: the
                    // design allows a long reason, just not a multi-line one
                    // (PDT-5228).
                    multiLine
                    blockNewLine
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
          </>
        )}

        <View style={styles.bottomBar}>
          {isMessageDeleted ? (
            <Button
              hierarchy="primary"
              size="lg"
              fullWidth
              label={closeButtonText}
              onPress={onClose}
            />
          ) : (
            <Button
              hierarchy="primary"
              size="lg"
              fullWidth
              label={submitButtonText}
              disabled={isDisabledSubmitButton}
              onPress={handleSubmitReport}
            />
          )}
        </View>
      </View>
    </BottomSheet>
  );
}
