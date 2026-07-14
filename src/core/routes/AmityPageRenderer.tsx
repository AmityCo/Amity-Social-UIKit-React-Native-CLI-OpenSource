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
import {
  UserProfileScreen,
  EditUserScreen,
  UserRelationshipScreen,
  BlockedUsersScreen,
  UserPendingFollowRequests,
} from '../../social/screens';
import CreateCommunity from '../../social/screens/CreateCommunity';
import type { MyMD3Theme } from '../providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';
import PostTypeChoiceModal from '../../social/components/legacy/PostTypeChoiceModal/PostTypeChoiceModal';
import Toast from '../../social/components/legacy/Toast/Toast';
import SnackbarToast from '../../social/components/Toast';
import AmitySocialGlobalSearchPage from '../../social/screens/SocialGlobalSearch';
import AmityMyCommunitiesSearchPage from '../../social/screens/MyCommunitiesSearch';
import PostTargetSelection from '../../social/screens/PostTargetSelection';
import AmityAllCategoriesPage from '../../social/screens/AllCategories';
import AmityCommunitiesByCategoryPage from '../../social/screens/CommunitiesByCategory';
import EditPost from '../../social/screens/EditPost/EditPost';
import AmityExploreComponent from '../../social/features/feed/components/Explore';
import PollPostComposer from '../../social/screens/PollPostComposer';
import CommunityAddCategory from '../../social/screens/CommunityAddCategory';
import CommunityAddMember from '../../social/screens/CommunityAddMember';
import EditCommunity from '../../social/screens/EditCommunity';
import CommunityPostPermission from '../../social/screens/CommunityPostPermission';
import { CommunityNotificationSettingScreen } from '../../social/screens/CommunityNotificationSetting';
import { CommunityPostsNotificationSettingScreen } from '../../social/screens/CommunityPostsNotificationSetting';
import { CommunityCommentsNotificationSettingScreen } from '../../social/screens/CommunityCommentsNotificationSetting';
import CommunityPendingRequest from '../../social/screens/CommunityPendingRequest';
import CommunitySetting from '../../social/screens/CommunitySetting';
import AmityCommunityProfilePage from '../../social/screens/CommunityProfile';
import PollTargetSelection from '../../social/screens/PollTargetSelection';
import CommunityMembership from '../../social/screens/CommunityMembership';

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
              name="AmityPostEngagementContentComponent"
              children={() => children}
            />
            {/* Prop-driven page (e.g. AmityCreateProfilePage) rendered directly
                by the host. The component's displayName resolves to this route
                so it can be the navigator's initialRouteName. */}
            <Stack.Screen
              name="AmityCreateUserProfilePage"
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
          </Stack.Navigator>
        )}
        <PostTypeChoiceModal />
        <Toast />
        {/* Redux toastSlice renderer (useToast). The legacy Toast above reads a
            different slice (state.ui), so pages using useToast need this. */}
        <SnackbarToast />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
