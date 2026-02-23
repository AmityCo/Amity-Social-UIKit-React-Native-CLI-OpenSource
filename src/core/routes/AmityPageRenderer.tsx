/* eslint-disable react/no-unstable-nested-components */
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './RouteParamList';
import useAuth from '../hooks/useAuth';
import AmitySocialHomePage from '../../social/screens/SocialHomePage';
import PostDetail from '../../social/screens/PostDetail';
import CreatePost from '../../social/screens/CreatePost';
import UserProfile from '../../social/screens/UserProfile';
import { EditProfile } from '../../social/screens/EditProfile/EditProfile';
import UserProfileSetting from '../../social/screens/UserProfileSetting/UserProfileSetting';
import CreateCommunity from '../../social/screens/CreateCommunity';
import type { MyMD3Theme } from '../providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';
import BackButton from '../../social/components/legacy/BackButton';
import PostTypeChoiceModal from '../../social/components/legacy/PostTypeChoiceModal/PostTypeChoiceModal';
import CreateStoryScreen from '../../social/screens/CreateStory/CreateStoryScreen';
import Toast from '../../social/components/legacy/Toast/Toast';
import AmitySocialGlobalSearchPage from '../../social/screens/SocialGlobalSearch';
import UserPendingRequest from '../../social/screens/UserPendingRequest/UserPendingRequest';
import FollowerList from '../../social/screens/FollowerList/FollowerList';
import AmityMyCommunitiesSearchPage from '../../social/screens/MyCommunitiesSearch';
import PostTargetSelection from '../../social/screens/PostTargetSelection';
import StoryTargetSelection from '../../social/features/story/TargetSelection/TargetSelection';
import AmityAllCategoriesPage from '../../social/screens/AllCategories';
import AmityCommunitiesByCategoryPage from '../../social/screens/CommunitiesByCategory';
import EditPost from '../../social/screens/EditPost/EditPost';
import AmityExploreComponent from '../../social/features/feed/components/Explore';
import PollPostComposer from '../../social/screens/PollPostComposer';
import CommunityAddCategory from '../../social/screens/CommunityAddCategory';
import CommunityAddMember from '../../social/screens/CommunityAddMember';
import EditCommunity from '../../social/screens/EditCommunity';
import CommunityPostPermission from '../../social/screens/CommunityPostPermission';
import CommunityStorySetting from '../../social/screens/CommunityStorySetting';
import CommunityNotificationSetting from '../../social/screens/CommunityNotificationSetting';
import CommunityPostsNotificationSetting from '../../social/screens/CommunityPostsNotificationSetting';
import CommunityCommentsNotificationSetting from '../../social/screens/CommunityCommentsNotificationSetting';
import CommunityStoriesNotificationSetting from '../../social/screens/CommunityStoriesNotificationSetting';
import CommunityLivestreamsNotificationSetting from '../../social/screens/CommunityLivestreamsNotificationSetting';
import CommunityPendingRequest from '../../social/screens/CommunityPendingRequest';
import CommunitySetting from '../../social/screens/CommunitySetting';
import AmityCommunityProfilePage from '../../social/screens/CommunityProfile';
import LivestreamTerminated from '../../social/screens/LivestreamTerminated';
import PollTargetSelection from '../../social/screens/PollTargetSelection';
import LivestreamPostTargetSelection from '../../social/screens/LivestreamPostTargetSelection';
import CommunityMembership from '../../social/screens/CommunityMembership';
import CreateLivestream from '../../social/screens/CreateLivestream';
import LivestreamPlayer from '../../social/screens/LivestreamPlayer';

interface PageRendererProps {
  children: React.JSX.Element;
}
export default function PageRenderer({ children }: PageRendererProps) {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const { isConnected } = useAuth();
  const theme = useTheme() as MyMD3Theme;

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        {isConnected && (
          <Stack.Navigator
            id={undefined}
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
            initialRouteName={
              children.type?.displayName ||
              (children.type?.name as keyof RootStackParamList)
            }
          >
            <Stack.Screen
              name="AmityStoryTabComponent"
              children={() => children}
            />
            <Stack.Screen
              name="AmityPostEngagementContentComponent"
              children={() => children}
            />

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
            <Stack.Screen
              name="AmityExploreComponent"
              component={AmityExploreComponent}
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
              children={() => <AmityCommunityProfilePage {...children.props} />}
            />
            <Stack.Screen
              name="CommunityPendingRequest"
              component={CommunityPendingRequest}
            />
            <Stack.Screen
              name="CommunitySetting"
              component={CommunitySetting}
            />
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
              component={CommunityNotificationSetting}
            />
            <Stack.Screen
              name="CommunityPostsNotificationSetting"
              component={CommunityPostsNotificationSetting}
            />
            <Stack.Screen
              name="CommunityCommentsNotificationSetting"
              component={CommunityCommentsNotificationSetting}
            />
            <Stack.Screen
              name="CommunityStoriesNotificationSetting"
              component={CommunityStoriesNotificationSetting}
            />
            <Stack.Screen
              name="CommunityLivestreamsNotificationSetting"
              component={CommunityLivestreamsNotificationSetting}
            />

            {/* --- POST --- */}
            <Stack.Screen
              name="PostTargetSelection"
              component={PostTargetSelection}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="CreatePost" component={CreatePost} />
            <Stack.Screen name="EditPost" component={EditPost} />
            <Stack.Screen
              name="PostDetail"
              children={() => <PostDetail {...children.props} />}
            />

            {/* --- POLL --- */}
            <Stack.Screen
              name="PollTargetSelection"
              component={PollTargetSelection}
              options={{ animation: 'slide_from_bottom' }}
            />

            <Stack.Screen
              name="PollPostComposer"
              component={PollPostComposer}
            />

            {/* --- User --- */}
            <Stack.Screen
              name="UserProfile"
              children={() => <UserProfile {...children.props} />}
              options={{
                headerTitleAlign: 'center',
                title: '',
              }}
            />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen
              name="UserProfileSetting"
              component={UserProfileSetting}
            />
            <Stack.Screen
              name="UserPendingRequest"
              component={UserPendingRequest}
              options={{
                title: 'Follow Requests',
                headerLeft: () => <BackButton />,
              }}
            />
            <Stack.Screen
              name="FollowerList"
              component={FollowerList}
              options={({
                route: {
                  params: { displayName },
                },
              }: any) => ({
                title: displayName,
                headerLeft: () => <BackButton />,
              })}
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
          </Stack.Navigator>
        )}
        <PostTypeChoiceModal />
        <Toast />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
