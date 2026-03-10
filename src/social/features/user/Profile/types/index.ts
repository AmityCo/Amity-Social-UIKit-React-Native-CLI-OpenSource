export enum UserProfileTab {
  Feed = 'feed',
  Image = 'image',
  Video = 'video',
}

export type FeedRef = {
  loadMore: () => void;
};
