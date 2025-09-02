import { useDispatch, useSelector } from 'react-redux';
import { ComponentID, PageID } from '~/v4/enum';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface BottomSheetState {
  open: boolean;
  content: JSX.Element | null;
  height?: number;
  pageId?: PageID;
  componentId?: ComponentID;
}

type OpenBottomSheetPayload = {
  content: JSX.Element;
  height?: number;
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
    },
    closeBottomSheet: (state) => {
      state.open = false;
      state.height = 0;
    },
    clearContent: (state) => {
      state.content = null;
    },
  },
});

export default bottomSheetSlice;

export const useBottomSheet = () => {
  const dispatch = useDispatch();
  const {
    openBottomSheet: $openBottomSheet,
    closeBottomSheet: $closeBottomSheet,
    clearContent,
  } = bottomSheetSlice.actions;

  const {
    content: $content,
    open: $open,
    height: $height,
  } = useSelector<RootState, BottomSheetState>((state) => state.bottomSheet);

  const openBottomSheet = ({ content, height }: OpenBottomSheetPayload) => {
    dispatch($openBottomSheet({ content, height }));
  };

  const closeBottomSheet = () => {
    dispatch($closeBottomSheet());
    setTimeout(() => {
      dispatch(clearContent());
    }, 500);
  };

  return {
    openBottomSheet,
    height: $height,
    closeBottomSheet,
    content: $content,
    open: $open,
  };
};
