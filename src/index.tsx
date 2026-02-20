import { BackHandler } from 'react-native';
import AmityUiKitProvider from './core/providers/AmityUIKitProvider';
import { ErrorBoundary } from './core/components/ErrorBoundary';
import AmityUiKitSocial from './core/routes/AmityUIKitNavigator';
import AmityPageRenderer from './core/routes/AmityPageRenderer';
import PostDetail from './social/screens/PostDetail';
import CommunityHome from './social/screens/CommunityHome';
import UserProfile from './social/screens/UserProfile';
import {
  AmityStoryTabComponent,
  AmityCreateStoryPage,
  AmityDraftStoryPage,
  AmityViewStoryPage,
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
  AmityStoryTargetSelectionPage,
  AmityUserSearchResultComponent,
  AmityMyCommunitiesSearchPage,
  AmityExploreComponent,
  AmityAllCategoriesPage,
  AmityCommunitiesByCategoryPage,
  AmityCommunityProfilePage as CommunityProfilePage,
  AmityCreateLivestreamPage,
  AmityLivestreamPostTargetSelectionPage,
  AmityLivestreamTerminatedPage,
  AmityLivestreamPlayerPage,
  AmityPollTargetSelectionPage,
  AmityPollPostComposerPage,
  AmityCommunityFeedComponent,
  AmityCommunityHeaderComponent,
  AmityCommunityImageFeedComponent,
  AmityCommunityVideoFeedComponent,
  AmityThumbnailActionComponent,
  AmityUserProfilePage,
  AmityPostEngagementContentComponent,
  AmityPostTargetType,
  AmityCommunitySetupPage,
  AmityCommunityAddCategoryPage,
  AmityCommunityAddMemberPage,
  AmityCommunityPendingRequestPage,
  AmityCommunitySettingPage,
  AmityCommunityMembershipPage,
  AmityCommunityPostPermissionPage,
  AmityCommunityStorySettingPage,
  AmityCommunityNotificationSettingPage,
  AmityCommunityPostsNotificationSettingPage,
  AmityCommunityCommentsNotificationSettingPage,
  AmityCommunityStoriesNotificationSettingPage,
  AmityCommunityLivestreamsNotificationSettingPage,
  AmityCommunityPinnedPostComponent,
  AmityPendingPostListComponent,
} from './public-api';
import {
  AmityStoryTabComponentEnum,
  AmityPostComposerMode,
  mediaAttachment,
} from './social/types';
import { AmityGlobalStoryTabWrapper } from './social/components/MyStories';

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
  AmityStoryTabComponent,
  AmityStoryTabComponentEnum,
  AmityCreateStoryPage,
  AmityDraftStoryPage,
  AmityViewStoryPage,
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
  AmityStoryTargetSelectionPage,
  AmityUserSearchResultComponent,
  AmityMyCommunitiesSearchPage,
  AmityPostComposerMode,
  mediaAttachment,
  AmityExploreComponent,
  AmityPageRenderer,
  PostDetail,
  CommunityHome,
  UserProfile,
  AmityAllCategoriesPage,
  AmityCommunitiesByCategoryPage,
  CommunityProfilePage,
  AmityCreateLivestreamPage,
  AmityLivestreamPostTargetSelectionPage,
  AmityLivestreamTerminatedPage,
  AmityLivestreamPlayerPage,
  AmityPollTargetSelectionPage,
  AmityPollPostComposerPage,
  AmityCommunityFeedComponent,
  AmityCommunityHeaderComponent,
  AmityCommunityImageFeedComponent,
  AmityCommunityVideoFeedComponent,
  AmityThumbnailActionComponent,
  AmityUserProfilePage,
  AmityPostEngagementContentComponent,
  AmityPostTargetType,
  AmityCommunitySetupPage,
  AmityCommunityAddCategoryPage,
  AmityCommunityAddMemberPage,
  AmityCommunityPendingRequestPage,
  AmityCommunitySettingPage,
  AmityCommunityMembershipPage,
  AmityCommunityPostPermissionPage,
  AmityCommunityStorySettingPage,
  AmityCommunityNotificationSettingPage,
  AmityCommunityPostsNotificationSettingPage,
  AmityCommunityCommentsNotificationSettingPage,
  AmityCommunityStoriesNotificationSettingPage,
  AmityCommunityLivestreamsNotificationSettingPage,
  AmityCommunityPinnedPostComponent,
  AmityPendingPostListComponent,
  AmityGlobalStoryTabWrapper,
};
