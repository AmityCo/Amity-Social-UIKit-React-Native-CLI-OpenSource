import { configureStore } from '@reduxjs/toolkit';
import globalFeedSlice from '../slices/globalfeedSlice';
import feedSlice from '../slices/feedSlice';
import postDetailSlice from '../slices/postDetailSlice';
import uiSlice from '../slices/uiSlice';
import bottomSheetSlice from '../slices/bottomSheetSlice';
import toastSlice from '../../v4/stores/slices/toast';

export const store = configureStore({
  reducer: {
    globalFeed: globalFeedSlice.reducer,
    postDetail: postDetailSlice.reducer,
    feed: feedSlice.reducer,
    ui: uiSlice.reducer,
    bottomSheet: bottomSheetSlice.reducer,
    toast: toastSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
