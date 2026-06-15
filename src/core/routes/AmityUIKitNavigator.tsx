import { useEffect, useRef } from 'react';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { View } from 'react-native';
import { navigationRef, onNavigationReady } from './navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './RouteParamList';
import useAuth from '../hooks/useAuth';
import AmitySocialHomePage from '../../social/screens/SocialHomePage';
import PostDetail from '../../social/screens/PostDetail';
import CreatePost from '../../social/screens/CreatePost';
import CreateCommunity from '../../social/screens/CreateCommunity';
import type { MyMD3Theme } from '../providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';
import PostTypeChoiceModal from '../../social/components/legacy/PostTypeChoiceModal/PostTypeChoiceModal';
import CreateStoryScreen from '../../social/screens/CreateStory/CreateStoryScreen';
import Toast from '../../social/components/legacy/Toast/Toast';
import AmitySocialGlobalSearchPage from '../../social/screens/SocialGlobalSearch';
import AmityMyCommunitiesSearchPage from '../../social/screens/MyCommunitiesSearch';
import CreateLivestream from '../../social/screens/CreateLivestream';
import PostTargetSelection from '../../social/screens/PostTargetSelection';
import StoryTargetSelection from '../../social/features/story/TargetSelection/TargetSelection';
import LivestreamPostTargetSelection from '../../social/screens/LivestreamPostTargetSelection';
import AmityAllCategoriesPage from '../../social/screens/AllCategories';
import AmityCommunitiesByCategoryPage from '../../social/screens/CommunitiesByCategory';
import AmityCommunityProfilePage from '../../social/screens/CommunityProfile';
import EditPost from '../../social/screens/EditPost/EditPost';
import LivestreamPlayer from '../../social/screens/LivestreamPlayer';
import LivestreamTerminated from '../../social/screens/LivestreamTerminated';
import PollTargetSelection from '../../social/screens/PollTargetSelection';
import PollPostComposer from '../../social/screens/PollPostComposer';
import CommunityAddCategory from '../../social/screens/CommunityAddCategory';
import CommunityAddMember from '../../social/screens/CommunityAddMember';
import EditCommunity from '../../social/screens/EditCommunity';
import CommunitySetting from '../../social/screens/CommunitySetting';
import CommunityMembership from '../../social/screens/CommunityMembership';
import CommunityPostPermission from '../../social/screens/CommunityPostPermission';
import CommunityStorySetting from '../../social/screens/CommunityStorySetting';
import { CommunityNotificationSettingScreen } from '../../social/screens/CommunityNotificationSetting';
import { CommunityPostsNotificationSettingScreen } from '../../social/screens/CommunityPostsNotificationSetting';
import { CommunityCommentsNotificationSettingScreen } from '../../social/screens/CommunityCommentsNotificationSetting';
import { CommunityStoriesNotificationSettingScreen } from '../../social/screens/CommunityStoriesNotificationSetting';
import { CommunityLivestreamsNotificationSettingScreen } from '../../social/screens/CommunityLivestreamsNotificationSetting';
import CommunityPendingRequest from '../../social/screens/CommunityPendingRequest';
import { GlobalBan } from '../../social/screens/GlobalBan';
import { VisitorUsageLimit } from '../../social/screens/VisitorUsageLimit';
import { useBehaviour } from '../../social/providers/BehaviourProvider';
import {
  ImageViewerScreen,
  VideoPlayerScreen,
  EditUserScreen,
  UserProfileScreen,
  UserRelationshipScreen,
  BlockedUsersScreen,
  UserPendingFollowRequests,
} from '../../social/screens';

const Stack = createNativeStackNavigator<
  RootStackParamList,
  'AmitySocialUIKit'
>();

export default function AmitySocialUIKitV4Navigator() {
  const theme = useTheme<MyMD3Theme>();
  const { isGlobalBan, isVisitorUsageLimitReached, isConnected } = useAuth();
  const { AmityGlobalBehavior } = useBehaviour();

  const handleVisitorUsageLimitReached =
    AmityGlobalBehavior?.handleVisitorUsageLimitReached;
  const hasHandledUsageLimit = useRef(false);

  useEffect(() => {
    if (!isVisitorUsageLimitReached) {
      hasHandledUsageLimit.current = false;
      return;
    }
    // Customer override replaces the default full-page swap; guard so rapid
    // repeat events trigger a single navigation.
    if (handleVisitorUsageLimitReached && !hasHandledUsageLimit.current) {
      hasHandledUsageLimit.current = true;
      handleVisitorUsageLimitReached();
    }
  }, [isVisitorUsageLimitReached, handleVisitorUsageLimitReached]);

  if (isGlobalBan) return <GlobalBan />;

  // Wait for the session to establish before mounting the home page. Until then
  // isVisitorOrBot is unknown (defaults to false), so rendering now would flash
  // the full signed-in UIKit for a frame before resolving to visitor mode.
  if (!isConnected) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
    );
  }

  // Default usage-limit handling: replace the whole navigation tree with the
  // dead-end error page so back-navigation cannot escape it.
  if (isVisitorUsageLimitReached && !handleVisitorUsageLimitReached) {
    return <VisitorUsageLimit />;
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
        <Stack.Navigator
          id="AmitySocialUIKit"
          screenOptions={{
            headerShown: false,
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTitleStyle: {
              color: theme.colors.base,
            },
          }}
        >
          {/* --- Social Home --- */}
          <Stack.Screen
            name="AmitySocialHomePage"
            component={AmitySocialHomePage}
          />
          <Stack.Screen
            name="AmitySocialGlobalSearchPage"
            component={AmitySocialGlobalSearchPage}
          />
          <Stack.Screen
            name="AmityMyCommunitiesSearchPage"
            component={AmityMyCommunitiesSearchPage}
          />

          {/* --- Category --- */}
          <Stack.Screen
            name="AllCategoriesPage"
            component={AmityAllCategoriesPage}
          />
          <Stack.Screen
            name="CommunitiesByCategoryPage"
            component={AmityCommunitiesByCategoryPage}
          />

          {/* --- COMMUNITY --- */}
          <Stack.Screen name="CreateCommunity" component={CreateCommunity} />
          <Stack.Screen
            name="CommunityAddCategory"
            component={CommunityAddCategory}
          />
          <Stack.Screen
            name="CommunityAddMember"
            component={CommunityAddMember}
          />
          <Stack.Screen
            name="CommunityProfilePage"
            component={AmityCommunityProfilePage}
          />
          <Stack.Screen
            name="CommunityPendingRequest"
            component={CommunityPendingRequest}
          />
          <Stack.Screen name="CommunitySetting" component={CommunitySetting} />
          <Stack.Screen name="EditCommunity" component={EditCommunity} />
          <Stack.Screen
            name="CommunityMembership"
            component={CommunityMembership}
          />
          <Stack.Screen
            name="CommunityPostPermission"
            component={CommunityPostPermission}
          />
          <Stack.Screen
            name="CommunityStorySetting"
            component={CommunityStorySetting}
          />
          <Stack.Screen
            name="CommunityNotificationSetting"
            component={CommunityNotificationSettingScreen}
          />
          <Stack.Screen
            name="CommunityPostsNotificationSetting"
            component={CommunityPostsNotificationSettingScreen}
          />
          <Stack.Screen
            name="CommunityCommentsNotificationSetting"
            component={CommunityCommentsNotificationSettingScreen}
          />
          <Stack.Screen
            name="CommunityStoriesNotificationSetting"
            component={CommunityStoriesNotificationSettingScreen}
          />
          <Stack.Screen
            name="CommunityLivestreamsNotificationSetting"
            component={CommunityLivestreamsNotificationSettingScreen}
          />

          {/* --- POST --- */}
          <Stack.Screen
            name="PostTargetSelection"
            component={PostTargetSelection}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="CreatePost" component={CreatePost} />
          <Stack.Screen name="EditPost" component={EditPost} />
          <Stack.Screen name="PostDetail" component={PostDetail} />

          {/* --- POLL --- */}
          <Stack.Screen
            name="PollTargetSelection"
            component={PollTargetSelection}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="PollPostComposer" component={PollPostComposer} />

          {/* --- User --- */}
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="EditUser" component={EditUserScreen} />
          <Stack.Screen
            name="UserRelationship"
            component={UserRelationshipScreen}
          />
          <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
          <Stack.Screen
            name="UserPendingFollowRequests"
            component={UserPendingFollowRequests}
          />

          {/* --- Story --- */}
          <Stack.Screen
            name="StoryTargetSelection"
            component={StoryTargetSelection}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="CreateStory"
            component={CreateStoryScreen}
            options={{ animation: 'slide_from_bottom' }}
          />

          {/* --- Livestream --- */}
          <Stack.Screen
            name="LivestreamPostTargetSelection"
            component={LivestreamPostTargetSelection}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="CreateLivestream"
            component={CreateLivestream}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="LivestreamPlayer"
            component={LivestreamPlayer}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="LivestreamTerminated"
            component={LivestreamTerminated}
            options={{ animation: 'slide_from_bottom' }}
          />

          {/* --- Image --- */}
          <Stack.Screen
            name="ImageViewer"
            component={ImageViewerScreen}
            options={{ animation: 'none', presentation: 'transparentModal' }}
          />

          {/* --- Video --- */}
          <Stack.Screen
            name="VideoPlayer"
            component={VideoPlayerScreen}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'transparentModal',
            }}
          />
        </Stack.Navigator>
        <PostTypeChoiceModal />
        <Toast />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
