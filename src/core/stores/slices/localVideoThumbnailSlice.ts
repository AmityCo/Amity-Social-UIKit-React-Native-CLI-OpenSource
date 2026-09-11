import { PayloadAction, createSlice } from '@reduxjs/toolkit';

/**
 * A video post has no server-side thumbnail until the backend finishes
 * transcoding, so for the first stretch of a new post's life the feed has
 * nothing to render. The composer has already decoded a frame locally to show
 * its own preview, so keep that frame around and let the feed borrow it until
 * the real one exists.
 *
 * Keyed by the ORIGINAL video's fileId, which is what the created post carries
 * in `data.videoFileId.original`. Mirrors web's LayoutProvider `videoThumbnail`
 * + the VideoContent fallback.
 *
 * Only the most recently created post is kept — the same bound web has — so
 * this never grows with session length. These are local file uris, valid only
 * for this process; nothing persists them.
 */
export type LocalVideoThumbnail = {
  /** fileId of the original (untranscoded) video */
  fileId: string;
  /** local uri of the frame the composer decoded */
  thumbnailUrl: string;
};

interface LocalVideoThumbnailState {
  postId: string | null;
  videos: LocalVideoThumbnail[];
}

const initialState: LocalVideoThumbnailState = {
  postId: null,
  videos: [],
};

const localVideoThumbnailSlice = createSlice({
  name: 'localVideoThumbnail',
  initialState,
  reducers: {
    setLocalVideoThumbnails: (
      state,
      action: PayloadAction<{
        postId: string;
        videos: LocalVideoThumbnail[];
      }>
    ) => {
      state.postId = action.payload.postId;
      state.videos = action.payload.videos.filter(
        ({ fileId, thumbnailUrl }) => !!fileId && !!thumbnailUrl
      );
    },
    clearLocalVideoThumbnails: (state) => {
      state.postId = null;
      state.videos = [];
    },
  },
});

export default localVideoThumbnailSlice;
