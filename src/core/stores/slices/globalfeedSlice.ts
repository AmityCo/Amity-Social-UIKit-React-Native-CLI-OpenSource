import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { isAmityAd } from '../../../social/hooks/useCustomRankingGlobalFeed';

interface GlobalFeedState {
  postList: (Amity.Post<any> | Amity.Ad)[];
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
    setNewGlobalFeed: (state, action: PayloadAction<Amity.Post<any>[]>) => {
      const seen = new Set<string>();
      state.postList = action.payload.filter((post) => {
        if (seen.has(post.postId)) return false;
        seen.add(post.postId);
        return true;
      });
    },
    updateGlobalFeed: (state, action: PayloadAction<Amity.Post<any>[]>) => {
      const uniqueIds = new Set(
        state.postList.map((post) =>
          isAmityAd(post) ? post.adId : post.postId
        )
      );
      const newUnique: (Amity.Post<any> | Amity.Ad)[] = [];
      for (const post of action.payload) {
        const id = isAmityAd(post) ? post.adId : post.postId;
        if (!uniqueIds.has(id)) {
          uniqueIds.add(id);
          newUnique.push(post);
        }
      }
      state.postList = [...state.postList, ...newUnique];
    },
    setPaginationData: (
      state,
      action: PayloadAction<{ next: string | null; previous: string | null }>
    ) => {
      state.paginationData = action.payload;
    },
    addPostToGlobalFeed: (state, action: PayloadAction<Amity.Post<any>>) => {
      const alreadyExists = state.postList.some(
        (item) => !isAmityAd(item) && item.postId === action.payload.postId
      );
      if (!alreadyExists) {
        state.postList = [action.payload, ...state.postList];
      }
    },
    updateByPostId: (
      state,
      action: PayloadAction<{ postId: string; postDetail: Amity.Post<any> }>
    ) => {
      const { postId, postDetail } = action.payload;
      const index = state.postList.findIndex(
        (item) => !isAmityAd(item) && item.postId === postId
      );
      // A post edited from a feed this list never held (a community feed, say)
      // is simply not here. Without this guard the -1 miss was written as a
      // "-1" property on the array: the real entries stayed stale and nothing
      // reported a failure.
      if (index < 0) return;
      state.postList[index] = postDetail;
    },
    deleteByPostId: (state, action: PayloadAction<{ postId: string }>) => {
      const { postId } = action.payload;
      const prevPostList: (Amity.Post<any> | Amity.Ad)[] = [...state.postList];
      const updatedPostList: (Amity.Post<any> | Amity.Ad)[] =
        prevPostList.filter(
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
