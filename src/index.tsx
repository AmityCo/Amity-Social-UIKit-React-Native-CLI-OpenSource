import { BackHandler } from 'react-native';
import {
  AmityPageRenderer,
  AmityUiKitProvider,
  AmityUiKitSocial,
  ErrorBoundary,
  navigate,
} from './core';
import {
  AmitySocialHomePage,
  AmitySocialHomeTopNavigationComponent,
  AmityCommunitySearchResultComponent,
  AmitySocialGlobalSearchPage,
  AmityTopSearchBarComponent,
  AmityEmptyNewsFeedComponent,
  AmityGlobalFeedComponent,
  AmityMyCommunitiesComponent,
  AmityNewsFeedComponent,
  AmityPostContentComponent,
  AmityPostDetailPage,
  AmityPostTargetSelectionPageType,
  AmityCreatePostMenuComponent,
  AmityDetailedMediaAttachmentComponent,
  AmityMediaAttachmentComponent,
  AmityPostCommentComponent,
  AmityPostComposerPage,
  AmityPostEngagementActionsComponent,
  AmityPostTargetSelectionPage,
  AmityReactionListComponent,
  AmityUserSearchResultComponent,
  AmityMyCommunitiesSearchPage,
  AmityExploreComponent,
  AmityAllCategoriesPage,
  AmityCommunitiesByCategoryPage,
  AmityCommunityProfilePage as CommunityProfilePage,
  AmityPollTargetSelectionPage,
  AmityPollPostComposerPage,
  AmityCommunityFeedComponent,
  AmityCommunityHeaderComponent,
  AmityCommunityImageFeedComponent,
  AmityCommunityVideoFeedComponent,
  AmityPostEngagementContentComponent,
  AmityPostTargetType,
  AmityCommunitySetupPage,
  AmityCommunityAddCategoryPage,
  AmityCommunityAddMemberPage,
  AmityCommunityPendingRequestPage,
  AmityCommunitySettingPage,
  AmityCommunityMembershipPage,
  AmityCommunityPostPermissionPage,
  AmityCommunityNotificationSettingPage,
  AmityCommunityPostsNotificationSettingPage,
  AmityCommunityCommentsNotificationSettingPage,
  AmityCommunityPinnedPostComponent,
  AmityPendingPostListComponent,
  AmityPostComposerMode,
  mediaAttachment,
  PostDetail,
  AmityUserProfilePage,
  AmityEditUserProfilePage,
  AmityCreateProfilePage,
  AmityUserRelationshipPage,
  AmityBlockedUsersPage,
  VisitorUsageLimit,
} from './social';

// Polyfill for BackHandler compatibility with older libraries like react-native-modalbox
// In React Native 0.65+, BackHandler.removeEventListener was removed
// This polyfill maintains backward compatibility
if (!(BackHandler as any).removeEventListener) {
  const listeners = new Map();
  const originalAddEventListener = BackHandler.addEventListener;

  BackHandler.addEventListener = (eventName, handler) => {
    const subscription = originalAddEventListener(eventName, handler);
    listeners.set(handler, subscription);
    return subscription;
  };

  (BackHandler as any).removeEventListener = (
    _eventName: string,
    handler: () => boolean
  ) => {
    const subscription = listeners.get(handler);
    if (subscription) {
      subscription.remove();
      listeners.delete(handler);
    }
  };
}

export {
  AmityUiKitProvider,
  ErrorBoundary,
  AmityUiKitSocial,
  VisitorUsageLimit,
  AmitySocialHomePage,
  AmitySocialHomeTopNavigationComponent,
  AmityCommunitySearchResultComponent,
  AmitySocialGlobalSearchPage,
  AmityTopSearchBarComponent,
  AmityEmptyNewsFeedComponent,
  AmityGlobalFeedComponent,
  AmityMyCommunitiesComponent,
  AmityNewsFeedComponent,
  AmityPostContentComponent,
  AmityPostDetailPage,
  AmityPostTargetSelectionPageType,
  AmityCreatePostMenuComponent,
  AmityDetailedMediaAttachmentComponent,
  AmityMediaAttachmentComponent,
  AmityPostCommentComponent,
  AmityPostComposerPage,
  AmityPostEngagementActionsComponent,
  AmityPostTargetSelectionPage,
  AmityReactionListComponent,
  AmityUserSearchResultComponent,
  AmityMyCommunitiesSearchPage,
  AmityPostComposerMode,
  mediaAttachment,
  AmityExploreComponent,
  AmityPageRenderer,
  PostDetail,
  AmityUserProfilePage,
  AmityEditUserProfilePage,
  AmityCreateProfilePage,
  AmityUserRelationshipPage,
  AmityBlockedUsersPage,
  AmityAllCategoriesPage,
  AmityCommunitiesByCategoryPage,
  CommunityProfilePage,
  AmityPollTargetSelectionPage,
  AmityPollPostComposerPage,
  AmityCommunityFeedComponent,
  AmityCommunityHeaderComponent,
  AmityCommunityImageFeedComponent,
  AmityCommunityVideoFeedComponent,
  AmityPostEngagementContentComponent,
  AmityPostTargetType,
  AmityCommunitySetupPage,
  AmityCommunityAddCategoryPage,
  AmityCommunityAddMemberPage,
  AmityCommunityPendingRequestPage,
  AmityCommunitySettingPage,
  AmityCommunityMembershipPage,
  AmityCommunityPostPermissionPage,
  AmityCommunityNotificationSettingPage,
  AmityCommunityPostsNotificationSettingPage,
  AmityCommunityCommentsNotificationSettingPage,
  AmityCommunityPinnedPostComponent,
  AmityPendingPostListComponent,
  navigate,
};
