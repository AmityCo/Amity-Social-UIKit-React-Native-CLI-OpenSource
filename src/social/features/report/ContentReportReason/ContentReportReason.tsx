import { View } from 'react-native';
import { BottomSheet } from '../../../../core/design/components/BottomSheet';
import { Button } from '../../../components/Button';
import ErrorComponent from '../../../components/ErrorComponent/ErrorComponent';
import Toast from '../../../components/Toast';
import { Header, OtherReasonField, ReasonList } from './components';
import { useContentReportReason } from './hooks';
import type { ContentReportReasonProps } from './types';

export function ContentReportReason(props: ContentReportReasonProps) {
  const {
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
    otherReasonMaxLength,
    texts,
    setSelectedReason,
    changeOtherReasonText,
    showOthersOption,
    hideOthersOption,
    requestClose,
    handleSheetClose,
    submitReport,
  } = useContentReportReason(props);

  return (
    <BottomSheet
      visible={isSheetVisible}
      height="90%"
      onClose={handleSheetClose}
    >
      <View testID={accessibilityId} style={styles.container}>
        <View style={styles.body}>
          {isContentDeleted ? (
            <ErrorComponent
              themeStyle={theme}
              title={texts.unavailableTitle}
              description={texts.unavailableDescription}
            />
          ) : (
            <>
              <Header
                title={texts.title}
                closeLabel={texts.close}
                showBackButton={isShowOthersOption}
                disabled={isPending}
                pageId={pageId}
                componentId={componentId}
                onBack={hideOthersOption}
                onClose={requestClose}
              />
              <BottomSheet.ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
              >
                {isShowOthersOption ? (
                  <OtherReasonField
                    title={texts.otherReasonTitle}
                    optionalLabel={texts.otherReasonOptional}
                    placeholder={texts.otherReasonPlaceholder}
                    value={otherReasonText}
                    maxLength={otherReasonMaxLength}
                    disabled={isPending}
                    onChangeText={changeOtherReasonText}
                  />
                ) : (
                  <ReasonList
                    description={texts.description}
                    reasons={reasons}
                    othersLabel={texts.others}
                    selectedReason={selectedReason}
                    disabled={isPending}
                    onSelectReason={setSelectedReason}
                    onPressOthers={showOthersOption}
                  />
                )}
              </BottomSheet.ScrollView>
            </>
          )}
          {/* The app-wide toast is drawn beneath native Modals, so the sheet
              shows its own while it is up (a failed report keeps it open). */}
          {isSheetVisible && <Toast />}
        </View>
        <View style={styles.footer}>
          {isContentDeleted ? (
            <Button
              testID={closeButtonId}
              accessibilityLabel={texts.close}
              onPress={requestClose}
            >
              {texts.close}
            </Button>
          ) : (
            <Button
              testID={submitButtonId}
              accessibilityLabel={texts.submit}
              disabled={isSubmitDisabled}
              onPress={submitReport}
            >
              {texts.submit}
            </Button>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}
