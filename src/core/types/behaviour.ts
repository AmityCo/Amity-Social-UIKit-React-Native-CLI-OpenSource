import { TabName } from '../../social/enums';
import { UserProfilePageProps } from '../../social/features/user/Profile/Profile';
import { RootStackParamList } from '../routes/RouteParamList';

export type AddCategoryPageContext = {
  categories: Amity.Category[];
  onAddedAction: (categories: Amity.Category[]) => void;
};

export type AddMemberPageContext = {
  users: Amity.User[];
  onAddedAction: (users: Amity.User[]) => void;
};

export type CommunitySettingPageContext = {
  community: Amity.Community;
};

export interface IBehaviour {
  AmityGlobalBehaviour?: {
    /**
     * Called when a visitor attempts a restricted action (comment, react,
     * follow, join…). Default shows a toast; override to open a sign-in flow.
     */
    handleVisitorUserAction?: () => void;
    /**
     * Called when a visitor session exceeds its daily usage limit (error
     * 400323). Providing this skips the default full-page
     * <VisitorUsageLimit /> swap so a custom error page can be shown instead.
     */
    handleVisitorUsageLimitReached?: () => void;
    /**
     * Called when "Sign in" is pressed on the usage-limit error page.
     * Default shows a toast; override to navigate to a sign-in flow.
     */
    handleVisitorUsageLimitSignIn?: () => void;
  };
  AmitySocialHomePageBehaviour?: {
    onChooseTab?: (arg?: string) => void;
  };
  AmitySocialHomeTopNavigationComponentBehaviour?: {
    goToGlobalSearchPage?: () => void;
    goToMyCommunitiesSearchPage?: () => void;
    onPressCreate?: () => void;
  };
  AmityGlobalFeedComponentBehavior?: {
    goToPostDetailPage?: (arg?: string) => void;
  };
  AmityPostContentComponentBehavior?: {
    goToCommunityProfilePage?: (arg?: {
      communityId?: string;
      communityName?: string;
    }) => void;
    goToUserProfilePage?: (arg?: { userId?: string }) => void;
    goToPostComposerPage?: () => void;
  };
  AmityPostComposerPageBehavior?: {
    onPressPost?: () => void;
  };
  AmityCommunitySearchResultComponent?: {
    goToCommunityProfilePage?: (arg?: {
      targetId: string;
      targetType: TabName.Communities;
    }) => void;
    goToUserProfilePage?: (arg?: {
      targetId: string;
      targetType: TabName.Users;
    }) => void;
  };
  AmityEmptyNewsFeedComponent?: {
    onPressCreateCommunity?: () => void;
    onPressExploreCommunity?: () => void;
  };
  AmityMyCommunitiesComponentBehaviour?: {
    onPressCommunity?: (arg?: {
      communityId: string;
      communityName: string;
    }) => void;
  };
  AmityCreatePostMenuComponentBehavior?: {
    goToSelectPostTargetPage?: (arg?: {
      postType: 'post' | 'story' | 'poll' | 'livestream';
    }) => void;
    goToSelectStoryTargetPage?: () => void;
    goToSelectLivestreamPostTargetPage?: () => void;
    goToSelectPollPostTargetPage?: () => void;
  };
  AmityPostTargetSelectionPageBehavior?: {
    goToPostComposerPage?: (arg?: {
      community: Amity.Community;
      targetId: string;
      targetType: 'community' | 'user';
    }) => void;
    goToPollComposerPage?: (arg?: {
      targetId: string;
      targetType: 'community' | 'user';
      targetName?: string;
      postSetting?: ValueOf<
        Readonly<{
          ONLY_ADMIN_CAN_POST: 'ONLY_ADMIN_CAN_POST';
          ADMIN_REVIEW_POST_REQUIRED: 'ADMIN_REVIEW_POST_REQUIRED';
          ANYONE_CAN_POST: 'ANYONE_CAN_POST';
        }>
      >;
      needApprovalOnPostCreation?: boolean;
      isPublic?: boolean;
    }) => void;
    goToCreateLivestreamPage?: (arg?: {
      targetId: string;
      targetType: 'community' | 'user';
      targetName?: string;
      postSetting?: ValueOf<
        Readonly<{
          ONLY_ADMIN_CAN_POST: 'ONLY_ADMIN_CAN_POST';
          ADMIN_REVIEW_POST_REQUIRED: 'ADMIN_REVIEW_POST_REQUIRED';
          ANYONE_CAN_POST: 'ANYONE_CAN_POST';
        }>
      >;
      needApprovalOnPostCreation?: boolean;
      isPublic?: boolean;
    }) => void;
    onClickClose?: () => void;
  };
  AmityStoryTargetSelectionPageBehavior?: {
    goToStoryComposerPage?: (arg?: {
      targetId: string;
      targetType: 'community' | 'user';
    }) => void;
    onClickClose?: () => void;
  };
  AmityLivestreamPostTargetSelectionPageBehavior?: {
    goToCreateLivestreamPage?: (arg?: {
      targetId: string;
      targetType: 'community' | 'user';
      targetName?: string;
      pop?: number;
      postSetting?: ValueOf<
        Readonly<{
          ONLY_ADMIN_CAN_POST: 'ONLY_ADMIN_CAN_POST';
          ADMIN_REVIEW_POST_REQUIRED: 'ADMIN_REVIEW_POST_REQUIRED';
          ANYONE_CAN_POST: 'ANYONE_CAN_POST';
        }>
      >;
      needApprovalOnPostCreation?: boolean;
      isPublic?: boolean;
    }) => void;
    onClickClose?: () => void;
  };
  AmityCommunityProfilePageBehavior?: {
    goToPendingPostPage?: () => void;
    goToCommunitySettingPage?: () => void;
    goToPostComposerPage?: () => void;
    goToCreateStoryPage?: () => void;
    goToMemberListPage?: () => void;
    goToPostDetailPage?: (arg?: string) => void;
  };
  AmityPollTargetSelectionPageBehavior?: {
    goToPollPostComposerPage?: (arg?: {
      targetId: string;
      targetType: 'community' | 'user';
      targetName?: string;
      pop?: number;
      community?: Amity.Community;
    }) => void;
    onClickClose?: () => void;
  };
  AmityCommunitySetupPageBehavior?: {
    goToAddCategoryPage?: (context: AddCategoryPageContext) => void;
    goToAddMemberPage?: (context: AddMemberPageContext) => void;
    goToCommunityProfilePage?: (context: { communityId: string }) => void;
  };
  AmityCommunitySettingPageBehavior?: {
    goToEditCommunityPage?: (context: CommunitySettingPageContext) => void;
    goToMembershipPage?: (context: CommunitySettingPageContext) => void;
    goToNotificationPage?: (context: CommunitySettingPageContext) => void;
    goToPostPermissionPage?: (context: CommunitySettingPageContext) => void;
    goToStorySettingPage?: (context: CommunitySettingPageContext) => void;
  };
  AmityCommunityMembershipPageBehavior?: {
    goToAddMemberPage?: (context: AddMemberPageContext) => void;
    goToUserProfilePage?: (context: UserProfilePageProps) => void;
  };
  AmityCommunityNotificationSettingPageBehavior?: {
    goToPostsNotificationSettingPage?: (
      context: CommunitySettingPageContext
    ) => void;

    goToCommentsNotificationSettingPage?: (
      context: CommunitySettingPageContext
    ) => void;

    goToStoriesNotificationSettingPage?: (
      context: CommunitySettingPageContext
    ) => void;

    goToLivestreamsNotificationSettingPage?: (
      context: CommunitySettingPageContext
    ) => void;
  };
  AmityUserProfilePageBehavior?: {
    goToPostComposerPage?: (context: RootStackParamList['CreatePost']) => void;
    goToPollPostComposerPage?: (
      context: RootStackParamList['PollPostComposer']
    ) => void;
    goToCreateLivestreamPage?: (
      context: RootStackParamList['CreateLivestream']
    ) => void;
    goToEditUserPage?: (context: RootStackParamList['EditUser']) => void;
    goToBlockedUsersPage?: () => void;
  };
  AmityBlockedUsersPageBehavior?: {
    goToUserProfilePage?: (context: RootStackParamList['UserProfile']) => void;
  };
  AmityUserRelationshipPageBehavior?: {
    goToUserProfilePage?: (context: RootStackParamList['UserProfile']) => void;
  };
  AmityUserProfileHeaderComponentBehavior?: {
    goToUserRelationshipPage?: (
      context: RootStackParamList['UserRelationship']
    ) => void;
    goToPendingFollowRequestPage?: () => void;
  };
  AmityUserPendingFollowRequestsPageBehavior?: {
    goToUserProfilePage?: (context: RootStackParamList['UserProfile']) => void;
  };
  AmityUserFeedComponentBehavior?: {
    goToPostDetailPage?: (arg?: string) => void;
  };
}
