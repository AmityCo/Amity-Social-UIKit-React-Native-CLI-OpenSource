import { NativeModules, Platform, BackHandler } from 'react-native';

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

import AmityUiKitProvider from './providers/amity-ui-kit-provider';
import { ErrorBoundary } from './components/ErrorBoundary';
import AmityUiKitSocial from './v4/routes/AmitySocialUIKitV4Navigator';
import AmityPageRenderer from './v4/routes/AmityPageRenderer';
import PostDetail from './v4/screen/PostDetail';
import CommunityHome from './v4/screen/CommunityHome';
import UserProfile from './v4/screen/UserProfile';
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
} from './v4';

import {
  AmityStoryTabComponentEnum,
  AmityPostComposerMode,
  mediaAttachment,
} from './v4/PublicApi/types';
import { AmityGlobalStoryTabWrapper } from './v4/component/MyStories';
import { useAmityLogout } from './hooks/useAmityLogout';

const LINKING_ERROR =
  `The package 'amity-react-native-social-ui-kit' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const AmityReactNativeSocialUiKit = NativeModules.AmityReactNativeSocialUiKit
  ? NativeModules.AmityReactNativeSocialUiKit
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

export function multiply(a: number, b: number): Promise<number> {
  return AmityReactNativeSocialUiKit.multiply(a, b + 2 + 3);
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
  useAmityLogout,
};
