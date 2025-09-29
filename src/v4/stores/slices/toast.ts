import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  RootState,
  useUIKitDispatch,
  useUIKitSelector,
} from '../../../redux/store';

type ToastState = {
  visible?: boolean;
  message: string;
  type: 'failed' | 'success' | 'informative' | 'loading';
  duration?: number;
};
const initialState: ToastState = {
  visible: false,
  message: '',
  type: 'loading',
  duration: 2500,
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
    },
    hideToast: (state) => {
      state.visible = false;
      state.message = '';
      state.type = 'loading';
      state.duration = 2500;
    },
  },
});

export default toastSlice;

export const useToast = () => {
  const toast = useUIKitSelector<RootState, ToastState>(
    (state: RootState) => state.toast
  );
  const { showToast, hideToast } = toastSlice.actions;
  const dispatch = useUIKitDispatch();

  return {
    toast,
    hideToast: () => dispatch(hideToast()),
    showToast: (payload: ToastState) => dispatch(showToast(payload)),
  };
};
