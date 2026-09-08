import type { IVideoPost } from '../components/legacy/Social/PostList';

/** A post child as the feed resolves it: the child post plus its own payload. */
export type ResolvedPostChild = {
  post?: Amity.Post;
  dataType?: string;
  data?: Record<string, any>;
};

export type ClassifiedPostChildren = {
  /** Medium-size download urls, de-duplicated. */
  images: string[];
  videos: IVideoPost[];
  polls: { pollId: string }[];
  livestreams: Amity.Room['roomId'][];
  /**
   * The media children the carousel renders, in the same order — and for
   * videos, at the same indices — as `videos`. The full-screen player is built
   * from `videos` but opened with an index taken from this array, so a child
   * that lands in one and not the other opens the wrong video.
   */
  media: Amity.Post[];
};

/**
 * Sort a post's resolved children into what each surface needs.
 *
 * Every hop into a child's payload is guarded, because the cost of being wrong
 * is out of proportion to the saving: an ErrorBoundary sits around the whole
 * UIKit without an onError, so one TypeError in here replaces the entire app
 * with a generic error page and takes its own stack down with it.
 *
 * `ContentDataVideo` types `videoFileId` as always present but every size
 * inside it as optional, so `original` is the hop that can legitimately be
 * missing. The keys above it are guarded on the same principle rather than on
 * evidence that they go missing.
 */
export function classifyPostChildren(
  children: ResolvedPostChild[],
  apiRegion: string
): ClassifiedPostChildren {
  const images: string[] = [];
  const videos: IVideoPost[] = [];
  const polls: { pollId: string }[] = [];
  const livestreams: Amity.Room['roomId'][] = [];
  const media: Amity.Post[] = [];

  children.forEach((item) => {
    if (item?.dataType === 'image' && item?.data?.fileId) {
      const url = `https://api.${apiRegion}.amity.co/api/v3/files/${item.data.fileId}/download?size=medium`;
      if (!images.includes(url)) {
        images.push(url);
        if (item.post) media.push(item.post);
      }
      return;
    }

    if (item?.dataType === 'video' && item?.data?.videoFileId?.original) {
      const isExisted = videos.some(
        (video) =>
          video.videoFileId?.original === item.data?.videoFileId?.original
      );
      if (!isExisted) {
        videos.push(item.data as IVideoPost);
        if (item.post) media.push(item.post);
      }
      return;
    }

    if (item?.dataType === 'poll' && item?.data?.pollId) {
      if (!polls.some((poll) => poll.pollId === item.data?.pollId)) {
        polls.push(item.data as { pollId: string });
      }
      return;
    }

    if (item?.dataType === 'room' && item?.data?.roomId) {
      if (!livestreams.includes(item.data.roomId)) {
        livestreams.push(item.data.roomId);
      }
    }
  });

  return { images, videos, polls, livestreams, media };
}
