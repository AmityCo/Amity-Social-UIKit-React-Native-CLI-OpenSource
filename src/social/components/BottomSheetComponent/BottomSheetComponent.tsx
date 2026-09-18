// The app's single bottom sheet. Anything that wants one dispatches content and
// a height through `useBottomSheet`; this is the one place it is rendered.
//
// It owns no geometry of its own — the sheet carries the sheet surface, the
// rounded top, the drag handle and the bottom safe-area inset.

// 1. React / RN imports
import { memo } from 'react';

// 3. Internal imports (relative)
import { BottomSheet } from '../../../core/design/components/BottomSheet';
import { useBottomSheet } from '../../../core/stores/slices/bottomSheetSlice';

const BottomSheetComponent = () => {
  const {
    closeBottomSheet,
    clearBottomSheetContent,
    content,
    open,
    height,
    dark,
  } = useBottomSheet();

  return (
    <BottomSheet
      visible={open}
      height={height ?? 0}
      dark={dark}
      onClose={() => {
        // The sheet has finished animating out by the time this runs, so this
        // is where the content goes — and `closeBottomSheet` is idempotent, so
        // a drag-to-close that never went through the store still settles it.
        closeBottomSheet();
        clearBottomSheetContent();
      }}
    >
      {content}
    </BottomSheet>
  );
};

export default memo(BottomSheetComponent);
