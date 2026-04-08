import { ComponentID, PageID } from '../../../social/enums';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState, useUIKitDispatch, useUIKitSelector } from '../store';

export interface BottomSheetState {
  open: boolean;
  content: React.JSX.Element | null;
  height?: number;
  dark?: boolean;
  pageId?: PageID;
  componentId?: ComponentID;
}

type OpenBottomSheetPayload = {
  content: React.JSX.Element;
  height?: number;
  dark?: boolean;
};

const initialState: BottomSheetState = {
  open: false,
  content: null,
  height: 200,
  pageId: PageID.WildCardPage,
  componentId: ComponentID.WildCardComponent,
};

const bottomSheetSlice = createSlice({
  name: 'bottomSheet',
  initialState,
  reducers: {
    openBottomSheet: (state, action: PayloadAction<OpenBottomSheetPayload>) => {
      state.open = true;
      state.content = action.payload.content;
      state.height = action.payload.height || 200;
      state.dark = action.payload.dark ?? false;
    },
    closeBottomSheet: (state) => {
      state.open = false;
      state.height = 0;
    },
    clearContent: (state) => {
      state.dark = false;
      state.content = null;
    },
  },
});

export default bottomSheetSlice;

export const useBottomSheet = () => {
  const dispatch = useUIKitDispatch();
  const {
    openBottomSheet: $openBottomSheet,
    closeBottomSheet: $closeBottomSheet,
    clearContent,
  } = bottomSheetSlice.actions;

  const bottomSheetHeight = {
    1: 150,
    2: 180,
    3: 220,
    4: 270,
    5: 300,
  };

  const {
    content: $content,
    open: $open,
    height: $height,
    dark: $dark,
  } = useUIKitSelector<RootState, BottomSheetState>(
    (state) => state.bottomSheet
  );

  const openBottomSheet = ({
    dark,
    height,
    content,
  }: OpenBottomSheetPayload) => {
    dispatch($openBottomSheet({ content, height, dark }));
  };

  const closeBottomSheet = () => {
    dispatch($closeBottomSheet());
    setTimeout(() => {
      dispatch(clearContent());
    }, 300);
  };

  return {
    openBottomSheet,
    height: $height,
    closeBottomSheet,
    content: $content,
    open: $open,
    dark: $dark,
    bottomSheetHeight,
  };
};
