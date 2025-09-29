import uiSlice from '../../redux/slices/uiSlice';
import { useCallback } from 'react';
import { getCommentErrorMessage } from '../utils/errors';
import { useUIKitDispatch } from '../../redux/store';

export const useToast = () => {
  const dispatch = useUIKitDispatch();
  const { showToastMessage } = uiSlice.actions;

  const showToast = useCallback(
    (message: string) => {
      dispatch(showToastMessage({ toastMessage: message }));
    },
    [dispatch, showToastMessage]
  );

  const showCommentErrorToast = (error: Error) => {
    const errorMessage = getCommentErrorMessage(error);
    showToast(errorMessage);
  };

  return { showCommentErrorToast, showToast };
};
