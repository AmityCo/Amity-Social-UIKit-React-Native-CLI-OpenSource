import { useRef, useState } from 'react';
import { Platform } from 'react-native';

// For owners whose menu is itself an RN Modal (the comment options menus).
//
// iOS presents one Modal at a time from a screen. A sheet asked to open while
// the menu Modal is still fading out is never presented, and is not retried
// once the menu is gone. So on iOS the sheet waits for the menu Modal's
// `onDismiss`. Android stacks its dialogs and never calls `onDismiss`, so the
// sheet opens straight away there.
export function useReportReasonSheet() {
  const [isReportReasonVisible, setIsReportReasonVisible] = useState(false);
  const isWaitingForMenuDismiss = useRef(false);

  const openReportReason = () => {
    if (Platform.OS === 'ios') {
      isWaitingForMenuDismiss.current = true;
      return;
    }
    setIsReportReasonVisible(true);
  };

  /** Hand to the menu Modal's `onDismiss`. */
  const onMenuDismiss = () => {
    if (!isWaitingForMenuDismiss.current) return;
    isWaitingForMenuDismiss.current = false;
    setIsReportReasonVisible(true);
  };

  const closeReportReason = () => setIsReportReasonVisible(false);

  return {
    isReportReasonVisible,
    openReportReason,
    closeReportReason,
    onMenuDismiss,
  };
}
