import {
  AmityPostComposerPageType,
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
  FollowerList: Amity.User;
  PostTargetSelection: { postType: AmityPostTargetSelectionPageType };

  AllCategoriesPage: undefined;
  CommunitiesByCategoryPage: {
    category: Amity.Category;
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

  CommunityNotificationSetting: {
    community: Amity.Community;
  };

  CommunityPostsNotificationSetting: {
    community: Amity.Community;
  };

  CommunityCommentsNotificationSetting: {
    community: Amity.Community;
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

  // Prop-driven page rendered via AmityPageRenderer (no route params). The
  // route only exists so the renderer can register a pass-through screen.
  AmityCreateUserProfilePage: undefined;

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
};
