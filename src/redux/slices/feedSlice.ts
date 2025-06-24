import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface FeedState {
  postList: Amity.Post<any>[];
}
const initialState: FeedState = {
  postList: [],
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    updateFeed: (state, action: PayloadAction<Amity.Post<any>[]>) => {
      const getUniqueArrayById = (arr: Amity.Post<any>[]) => {
        const uniqueIds = new Set(state.postList.map((post) => post.postId));
        return arr.filter((post) => !uniqueIds.has(post.postId));
      };
      state.postList = [
        ...getUniqueArrayById(action.payload),
        ...state.postList,
      ];
    },
    addPostToFeed: (state, action: PayloadAction<Amity.Post<any>>) => {
      state.postList = [action.payload, ...state.postList];
    },
    updateByPostId: (
      state,
      action: PayloadAction<{ postId: string; postDetail: Amity.Post<any> }>
    ) => {
      const { postId, postDetail } = action.payload;
      const index = state.postList.findIndex((item) => item.postId === postId);
      state.postList[index] = postDetail;
    },
    deleteByPostId: (state, action: PayloadAction<{ postId: string }>) => {
      const { postId } = action.payload;
      const prevPostList: Amity.Post<any>[] = [...state.postList];
      const updatedPostList: Amity.Post<any>[] = prevPostList.filter(
        (item) => item.postId !== postId
      );

      state.postList = updatedPostList;
    },
    clearFeed: (state) => {
      state.postList = [];
    },
  },
});

// const {actions: globalFeedActions, reducer: globalFeedReducer } = globalFeedSlice
export default feedSlice;
