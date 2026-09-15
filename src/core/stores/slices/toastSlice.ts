import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState, useUIKitDispatch, useUIKitSelector } from '../store';
import { getCommentErrorMessage } from '../../../social/utils/errors';
type ToastState = {
  visible?: boolean;
  message: string;
  type: 'failed' | 'success' | 'informative' | 'loading';
  duration?: number;
  bottomPosition?: number;
  // `custom` renders the dark pill used by chat notifications (bound to the
  // CustomToast design tokens); `default` keeps the app-wide toast appearance.
  variant?: 'default' | 'custom';
};
const initialState: ToastState = {
  visible: false,
  message: '',
  type: 'loading',
  duration: 2500,
  bottomPosition: 16,
  variant: 'default',
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<ToastState>) => {
      state.visible = true;
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.duration = action.payload.duration ?? initialState.duration;
      state.bottomPosition =
        action.payload.bottomPosition ?? initialState.bottomPosition;
      state.variant = action.payload.variant ?? initialState.variant;
    },
    hideToast: (state) => {
      state.visible = false;
      state.message = '';
      state.type = 'loading';
      state.duration = 2500;
      state.bottomPosition = 16;
      state.variant = 'default';
    },
  },
});

export default toastSlice;

export const useToast = () => {
  const dispatch = useUIKitDispatch();
  const toast = useUIKitSelector<RootState, ToastState>((state) => state.toast);
  const { showToast: $showToast, hideToast: $hideToast } = toastSlice.actions;

  const hideToast = () => dispatch($hideToast());

  const showToast = (payload: ToastState) => dispatch($showToast(payload));

  const showCommentErrorToast = (error: Error) => {
    const errorMessage = getCommentErrorMessage(error);
    showToast({ message: errorMessage, type: 'informative' });
  };

  return {
    toast,
    hideToast,
    showToast,
    showCommentErrorToast,
  };
};
