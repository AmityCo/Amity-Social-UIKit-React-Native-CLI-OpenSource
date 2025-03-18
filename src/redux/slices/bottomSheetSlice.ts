import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface BottomSheetState {
  isBottomSheetOpen: boolean;
  content: JSX.Element | null;
}

const initialState: BottomSheetState = {
  isBottomSheetOpen: false,
  content: null,
};

const bottomSheetSlice = createSlice({
  name: 'bottomSheet',
  initialState,
  reducers: {
    openBottomSheet: (state, action: PayloadAction<JSX.Element>) => {
      state.isBottomSheetOpen = true;
      state.content = action.payload;
    },
    closeBottomSheet: (state) => {
      state.isBottomSheetOpen = false;
      state.content = null;
    },
  },
});

export default bottomSheetSlice;
