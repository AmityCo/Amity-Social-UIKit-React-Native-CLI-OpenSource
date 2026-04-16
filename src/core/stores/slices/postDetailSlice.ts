import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface PostDetailState {
  currentIndex: number;
  currentPostdetail: Amity.Post<any> | {};
}
const initialState: PostDetailState = {
  currentIndex: 0,
  currentPostdetail: {},
};

const postDetailSlice = createSlice({
  name: 'postDetail',
  initialState,
  reducers: {
    updateCurrentIndex: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
    },
    updatePostDetail: (state, action: PayloadAction<Amity.Post<any>>) => {
      state.currentPostdetail = action.payload;
    },
  },
});

export default postDetailSlice;
