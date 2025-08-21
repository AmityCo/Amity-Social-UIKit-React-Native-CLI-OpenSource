import {
  AmityPostComposerPageType,
  AmityStoryTabComponentEnum,
} from '../PublicApi/types';
import { AmityPostTargetSelectionPageType } from '../enum';

export type RootStackParamList = {
  Home: { postIdCallBack?: string };
  AmitySocialGlobalSearchPage: undefined;
  AmityMyCommunitiesSearchPage: undefined;
  CommunitySearch: undefined;
  CommunityMemberDetail: {
    communityId: string;
  };
  CommunitySetting: {
    communityId: string;
    communityName: string;
  };
  CommunityList: {
    categoryId: string;
  };
  CommunityHome: {
    communityId: string;
    communityName: string;
    isModerator?: boolean;
  };
  MemberDetail: undefined;
  Community: undefined;
  AmityExploreComponent: undefined;
  CategoryList: undefined;
  CreatePost: AmityPostComposerPageType;
  EditPost: AmityPostComposerPageType;
  PostDetail: {
    postId: string;
    showEndPopup?: boolean;
  };
  UserProfile: {
    userId: string;
  };
  UserProfileSetting: {
    user: Amity.User;
    follow: string;
  };
  EditProfile: {
    user: Amity.User;
  };
  EditCommunity: {
    communityData: Amity.Community;
  };
  AllMyCommunity: undefined;
  CreateCommunity: undefined;
  VideoPlayer: { source: string };
  PendingPosts: { communityId: string; isModerator: boolean };
  ReactionList: { referenceId: string; referenceType: string };
  CreateStory: {
    targetId: string;
    targetType: Amity.StoryTargetType;
  };
  UserPendingRequest: undefined;
  FollowerList: Amity.User;
  PostTargetSelection: { postType: AmityPostTargetSelectionPageType };
  StoryTargetSelection: undefined;

  AllCategoriesPage: undefined;
  CommunitiesByCategoryPage: {
    category: Amity.Category;
  };
  LivestreamPostTargetSelection: undefined;
  CreateLivestream: {
    pop?: number;
    targetId: string;
    targetName: string;
    targetType: string;
  };
  LivestreamPlayer: {
    streamId: string;
    post: Amity.Post;
  };
  LivestreamTerminated: {
    type: 'streamer' | 'viewer';
  };
  CommunityProfilePage: {
    communityId: string;
    pop?: number;
  };
  PollTargetSelection: undefined;
  PollPostComposer: {
    targetId: string;
    targetType: 'community' | 'user';
    targetName?: string;
    pop?: number;
    community?: Amity.Community;
  };

  AmityStoryTabComponent: {
    type: AmityStoryTabComponentEnum;
    targetId?: string;
  };

  AmityPostEngagementContentComponent: {
    postId: string;
    targetId: string;
    targetType: Amity.PostTargetType;
  };
};
