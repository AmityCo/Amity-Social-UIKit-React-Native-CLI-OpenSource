import { useStyles } from './styles';
import React, { memo, useEffect, useRef } from 'react';
import { useBottomSheet } from '~/redux/slices/bottomSheetSlice';
import BottomSheet, { BottomSheetMethods } from '@devvie/bottom-sheet';

const BottomSheetComponent = () => {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const { closeBottomSheet, content, open, height } = useBottomSheet();

  const { styles } = useStyles();

  useEffect(() => {
    open ? sheetRef.current.open() : sheetRef.current.close();
  }, [open]);

  return (
    <BottomSheet
      ref={sheetRef}
      height={height}
      closeOnDragDown
      closeOnBackdropPress
      style={styles.container}
      onClose={closeBottomSheet}
    >
      {content}
    </BottomSheet>
  );
};

export default memo(BottomSheetComponent);
