export enum ImageSizeState {
  small = 'small',
  medium = 'medium',
  large = 'large',
  full = 'full',
}

export type ImageSizeSubset =
  | ImageSizeState.small
  | ImageSizeState.medium
  | ImageSizeState.large
  | ImageSizeState.full;

export enum PostTargetType {
  user = 'user',
  community = 'community',
  content = 'content',
}

export enum PrivacyState {
  private = 'private',
  public = 'public',
}

export enum SessionState {
  established = 'established',
  notLoggedIn = 'notLoggedIn',
  establishing = 'establishing',
  tokenExpired = 'tokenExpired',
  terminated = 'terminated',
}

export enum TabName {
  NewsFeed = 'NewsFeed',
  Explore = 'Explore',
  Timeline = 'Timeline',
  Gallery = 'Gallery',
  Communities = 'Communities',
  Accounts = 'Accounts',
  Members = 'Members',
  Moderators = 'Moderators',
  MyCommunities = 'MyCommunities',
  Videos = 'Videos',
  Photos = 'Photos',
  Following = 'Following',
  Followers = 'Followers',
}
