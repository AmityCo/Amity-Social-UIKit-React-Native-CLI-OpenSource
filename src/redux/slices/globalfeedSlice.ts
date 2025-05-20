import { PayloadAction, createSlice } from '@reduxjs/toolkit';
// import { Amity.Post } from '../../components/Social/PostList';
import { isAmityAd } from '../../v4/hook/useCustomRankingGlobalFeed';

interface GlobalFeedState {
  postList: (Amity.Post | Amity.Ad)[];
  paginationData: {
    next: string | null;
    previous: string | null;
  };
}
const initialState: GlobalFeedState = {
  postList: [],
  paginationData: {
    next: null,
    previous: null,
  },
};

const globalFeedSlice = createSlice({
  name: 'globalFeed',
  initialState,
  reducers: {
    setNewGlobalFeed: (state, action: PayloadAction<Amity.Post[]>) => {
      state.postList = [...action.payload];
    },
    updateGlobalFeed: (state, action: PayloadAction<Amity.Post[]>) => {
      const getUniqueArrayById = (arr: (Amity.Post | Amity.Ad)[]) => {
        const uniqueIds = new Set(
          state.postList.map((post) =>
            isAmityAd(post) ? post.adId : post.postId
          )
        );
        return arr.filter(
          (post) => !uniqueIds.has(isAmityAd(post) ? post.adId : post.postId)
        );
      };
      state.postList = [
        ...state.postList,
        ...getUniqueArrayById(action.payload),
      ];
    },
    setPaginationData: (
      state,
      action: PayloadAction<{ next: string | null; previous: string | null }>
    ) => {
      state.paginationData = action.payload;
    },
    addPostToGlobalFeed: (state, action: PayloadAction<Amity.Post>) => {
      state.postList = [action.payload, ...state.postList];
    },
    updateByPostId: (
      state,
      action: PayloadAction<{ postId: string; postDetail: Amity.Post }>
    ) => {
      const { postId, postDetail } = action.payload;
      const index = state.postList.findIndex(
        (item) => !isAmityAd(item) && item.postId === postId
      );
      state.postList[index] = postDetail;
    },
    deleteByPostId: (state, action: PayloadAction<{ postId: string }>) => {
      const { postId } = action.payload;
      const prevPostList: (Amity.Post | Amity.Ad)[] = [...state.postList];
      const updatedPostList: (Amity.Post | Amity.Ad)[] = prevPostList.filter(
        (item) => !isAmityAd(item) && item.postId !== postId
      );

      state.postList = updatedPostList;
    },
    clearFeed: (state) => {
      state.postList = [];
    },
  },
});

export default globalFeedSlice;
