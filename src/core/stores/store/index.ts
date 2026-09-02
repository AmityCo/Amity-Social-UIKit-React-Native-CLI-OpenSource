import { configureStore, Store } from '@reduxjs/toolkit';
import globalFeedSlice from '../slices/globalfeedSlice';
import feedSlice from '../slices/feedSlice';
import postDetailSlice from '../slices/postDetailSlice';
import uiSlice from '../slices/uiSlice';
import bottomSheetSlice from '../slices/bottomSheetSlice';
import toastSlice from '../slices/toastSlice';
import localVideoThumbnailSlice from '../slices/localVideoThumbnailSlice';
import { createContext } from 'react';
import {
  createStoreHook,
  createDispatchHook,
  createSelectorHook,
  ReactReduxContextValue,
} from 'react-redux';
import { AnyAction } from 'redux';

export const AmityUIKitReduxContext = createContext<
  ReactReduxContextValue<any, AnyAction>
>(null as any);

export const useUIKitStore = createStoreHook(AmityUIKitReduxContext as any);
export const useUIKitDispatch = createDispatchHook(
  AmityUIKitReduxContext as any
);
export const useUIKitSelector = createSelectorHook(
  AmityUIKitReduxContext as any
);

export const store: Store = configureStore({
  reducer: {
    globalFeed: globalFeedSlice.reducer,
    postDetail: postDetailSlice.reducer,
    feed: feedSlice.reducer,
    ui: uiSlice.reducer,
    bottomSheet: bottomSheetSlice.reducer,
    toast: toastSlice.reducer,
    localVideoThumbnail: localVideoThumbnailSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
