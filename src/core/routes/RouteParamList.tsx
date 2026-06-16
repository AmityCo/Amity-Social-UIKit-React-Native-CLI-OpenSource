import {
  AmityPostComposerPageType,
  AmityStoryTabComponentEnum,
  UserRelationshipTab,
} from '../../social/types';
import { AmityPostTargetSelectionPageType } from '../../social/enums';
import {
  AddCategoryPageContext,
  AddMemberPageContext,
} from '../types/behaviour';
import { AmityPostCategory } from '../../social/enums/AmityPostContentComponentStyle';

export type RootStackParamList = {
  AmitySocialHomePage: { postIdCallBack?: string };
  AmitySocialGlobalSearchPage: undefined;
  AmityMyCommunitiesSearchPage: undefined;
  CommunityHome: {
    communityId: string;
    communityName: string;
    isModerator?: boolean;
  };
  Community: undefined;
  AmityExploreComponent: undefined;
  CreatePost: AmityPostComposerPageType;
  EditPost: AmityPostComposerPageType;
  PostDetail: {
    postId: string;
    showEndPopup?: boolean;
    category?: AmityPostCategory;
    isDeleted?: boolean;
  };

  AllMyCommunity: undefined;
  ReactionList: { referenceId: string; referenceType: string };
  CreateStory: {
    targetId: string;
    targetType: Amity.StoryTargetType;
  };
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
    roomId: string;
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

  CreateCommunity: undefined;

  EditCommunity: {
    community: Amity.Community;
  };

  CommunityAddCategory: AddCategoryPageContext;

  CommunityAddMember: AddMemberPageContext;

  CommunityPendingRequest: {
    community: Amity.Community;
  };

  CommunitySetting: {
    community: Amity.Community;
  };

  CommunityMembership: {
    community: Amity.Community;
  };

  CommunityPostPermission: {
    community: Amity.Community;
  };

  CommunityStorySetting: {
    community: Amity.Community;
  };

  CommunityNotificationSetting: {
    community: Amity.Community;
  };

  CommunityPostsNotificationSetting: {
    community: Amity.Community;
  };

  CommunityCommentsNotificationSetting: {
    community: Amity.Community;
  };

  CommunityStoriesNotificationSetting: {
    community: Amity.Community;
  };

  CommunityLivestreamsNotificationSetting: {
    community: Amity.Community;
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

  UserProfile: {
    userId: string;
  };

  EditUser: {
    userId: string;
  };

  UserRelationship: {
    userId: string;
    selectedTab?: UserRelationshipTab;
  };

  BlockedUsers: undefined;

  UserPendingFollowRequests: undefined;

  ImageViewer: {
    images: { uri: string }[];
  };

  VideoPlayer: {
    source: string;
  };

  EventDetail: {
    eventId: string;
  };

  UpcomingEvents: {
    fromExplore?: boolean;
  };

  PastEvents: undefined;

  EventAttendees: {
    event: Amity.Event;
  };

  EventTargetSelection: undefined;

  EventSetup:
    | { mode: 'create'; targetId: string; targetName?: string }
    | { mode: 'edit'; event: Amity.Event };
};
