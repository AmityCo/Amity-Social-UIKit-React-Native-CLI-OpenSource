import { Store, configureStore } from '@reduxjs/toolkit';

import globalFeedSlice from '../slices/globalfeedSlice';
import feedSlice from '../slices/feedSlice';
import postDetailSlice from '../slices/postDetailSlice';
import uiSlice from '../slices/uiSlice';
import bottomSheetSlice from '../slices/bottomSheetSlice';
import toastSlice from '../../v4/stores/slices/toast';
import { createContext } from 'react';
import {
  createStoreHook,
  createDispatchHook,
  createSelectorHook,
} from 'react-redux';

export const AmityUIKitReduxContext = createContext(null);

export const useUIKitStore = createStoreHook(AmityUIKitReduxContext);
export const useUIKitDispatch = createDispatchHook(AmityUIKitReduxContext);
export const useUIKitSelector = createSelectorHook(AmityUIKitReduxContext);

export const store: Store = configureStore({
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

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
