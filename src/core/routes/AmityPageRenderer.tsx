/* eslint-disable react/no-unstable-nested-components */
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import * as React from 'react';
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import type { RootStackParamList } from './RouteParamList';
import useAuth from '../hooks/useAuth';
import CategoryList from '../../social/pages/CategorytList';
import CommunityList from '../../social/pages/CommunityList';

import CommunityMemberDetail from '../../social/pages/CommunityMemberDetail/CommunityMemberDetail';
import AmitySocialHomePage from '../../social/legacy/Pages/AmitySocialHomePage/AmitySocialHomePage';
import PostDetail from '../../social/pages/PostDetail';
import CreatePost from '../../social/pages/CreatePost';
import UserProfile from '../../social/pages/UserProfile';
import { EditProfile } from '../../social/pages/EditProfile/EditProfile';
import UserProfileSetting from '../../social/pages/UserProfileSetting/UserProfileSetting';
import CommunitySearch from '../../social/pages/CommunitySearch';
import AllMyCommunity from '../../social/pages/AllMyCommunity';
import CreateCommunity from '../../social/pages/CreateCommunity';
import PendingPosts from '../../social/pages/PendingPosts';
import type { MyMD3Theme } from '../providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { closeIcon } from '../assets/icons/xml';
import BackButton from '../../components/BackButton';
import VideoPlayerFull from '../../social/pages/VideoPlayerFullScreen';
import PostTypeChoiceModal from '../../components/PostTypeChoiceModal/PostTypeChoiceModal';
import ReactionListScreen from '../../social/pages/ReactionListScreen/ReactionListScreen';
import CreateStoryScreen from '../../social/pages/CreateStory/CreateStoryScreen';
import Toast from '../../components/Toast/Toast';
import AmitySocialGlobalSearchPage from '../../social/legacy/Pages/AmitySocialGlobalSearchPage/AmitySocialGlobalSearchPage';
import UserPendingRequest from '../../social/pages/UserPendingRequest/UserPendingRequest';
import FollowerList from '../../social/pages/FollowerList/FollowerList';
import AmityMyCommunitiesSearchPage from '../../social/legacy/Pages/AmityMyCommunitiesSearchPage/AmityMyCommunitiesSearchPage';
import PostTargetSelection from '../../social/pages/PostTargetSelection';
import StoryTargetSelection from '../../social/legacy/Pages/AmityStoryTargetSelectionPage/AmityStoryTargetSelectionPage';
import AmityAllCategoriesPage from '../../social/legacy/Pages/AmityAllCategoriesPage/AmityAllCategoriesPage';
import AmityCommunitiesByCategoryPage from '../../social/legacy/Pages/AmityCommunitiesByCategoryPage/AmityCommunitiesByCategoryPage';
import EditPost from '../../social/pages/EditPost/EditPost';
import AmityExploreComponent from '../../social/legacy/Components/AmityExploreComponent/AmityExploreComponent';
import PollPostComposer from '../../social/pages/PollPostComposer';
import CommunityAddCategory from '../../social/pages/CommunityAddCategory';
import CommunityAddMember from '../../social/pages/CommunityAddMember';
import EditCommunity from '../../social/pages/EditCommunity';
import CommunityPostPermission from '../../social/pages/CommunityPostPermission';
import CommunityStorySetting from '../../social/pages/CommunityStorySetting';
import CommunityNotificationSetting from '../../social/pages/CommunityNotificationSetting';
import CommunityPostsNotificationSetting from '../../social/pages/CommunityPostsNotificationSetting';
import CommunityCommentsNotificationSetting from '../../social/pages/CommunityCommentsNotificationSetting';
import CommunityStoriesNotificationSetting from '../../social/pages/CommunityStoriesNotificationSetting';
import CommunityLivestreamsNotificationSetting from '../../social/pages/CommunityLivestreamsNotificationSetting';
import CommunityPendingRequest from '../../social/pages/CommunityPendingRequest';
import CommunitySetting from '../../social/pages/CommunitySetting';
import AmityCommunityProfilePage from '../../social/legacy/Pages/AmityCommunityProfilePage/AmityCommunityProfilePage';
import LivestreamTerminated from '../../social/pages/LivestreamTerminated';
import PollTargetSelection from '../../social/pages/PollTargetSelection';
import LivestreamPostTargetSelection from '../../social/pages/LivestreamPostTargetSelection';
import CommunityMembership from '../../social/pages/CommunityMembership';
import CreateLivestream from '../../social/pages/CreateLivestream';
import LivestreamPlayer from '../../social/pages/LivestreamPlayer';

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
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AmityPostEngagementContentComponent"
              children={() => children}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AmitySocialHomePage"
              component={AmitySocialHomePage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AmitySocialGlobalSearchPage"
              component={AmitySocialGlobalSearchPage}
              options={{
                headerShown: false, // Remove the back button
              }}
            />
            <Stack.Screen
              name="AmityMyCommunitiesSearchPage"
              component={AmityMyCommunitiesSearchPage}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="AmityExploreComponent"
              component={AmityExploreComponent}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="PostDetail"
              options={{
                headerShown: false,
              }}
              children={() => <PostDetail {...children.props} />}
            />

            <Stack.Screen
              name="CategoryList"
              component={CategoryList}
              options={({}) => ({
                title: 'Category',
              })}
            />
            <Stack.Screen
              name="CommunityProfilePage"
              children={() => <AmityCommunityProfilePage {...children.props} />}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PendingPosts"
              component={PendingPosts}
              options={{ title: 'Pending Posts' }}
            />
            <Stack.Screen
              name="CommunitySearch"
              component={CommunitySearch}
              options={{
                headerShown: false, // Remove the back button
              }}
            />
            <Stack.Screen
              name="CommunityMemberDetail"
              component={CommunityMemberDetail}
              options={{
                headerLeft: () => <BackButton />,
                headerTitleAlign: 'center',
                title: 'Member',
              }}
            />
            <Stack.Screen
              name="CommunitySetting"
              component={CommunitySetting}
            />
            <Stack.Screen
              name="CommunityPendingRequest"
              component={CommunityPendingRequest}
            />
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
            <Stack.Screen name="EditCommunity" component={EditCommunity} />
            <Stack.Screen name="CommunityList" component={CommunityList} />
            <Stack.Screen
              name="AllMyCommunity"
              component={AllMyCommunity}
              options={({
                navigation,
              }: {
                navigation: NativeStackNavigationProp<any>;
              }) => ({
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.goBack();
                    }}
                  >
                    <SvgXml
                      xml={closeIcon(theme.colors.base)}
                      width="15"
                      height="15"
                    />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="CreatePost"
              component={CreatePost}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditPost"
              component={EditPost}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PollPostComposer"
              component={PollPostComposer}
            />
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
              name="VideoPlayer"
              component={VideoPlayerFull}
              options={{ headerShown: false }}
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
            <Stack.Screen
              name="AllCategoriesPage"
              component={AmityAllCategoriesPage}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CommunitiesByCategoryPage"
              component={AmityCommunitiesByCategoryPage}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Group
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_bottom',
              }}
            >
              <Stack.Screen
                name="ReactionList"
                component={ReactionListScreen}
                options={{
                  headerShown: true,
                  title: 'Reactions',
                  headerLeft: () => <BackButton />,
                }}
              />
              <Stack.Screen name="CreateStory" component={CreateStoryScreen} />
              <Stack.Screen
                name="PostTargetSelection"
                component={PostTargetSelection}
              />
              <Stack.Screen
                name="StoryTargetSelection"
                component={StoryTargetSelection}
              />
              <Stack.Screen
                name="CreateLivestream"
                component={CreateLivestream}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="LivestreamPlayer"
                component={LivestreamPlayer}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="LivestreamTerminated"
                component={LivestreamTerminated}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PollTargetSelection"
                component={PollTargetSelection}
              />
              <Stack.Screen
                name="LivestreamPostTargetSelection"
                component={LivestreamPostTargetSelection}
              />
            </Stack.Group>
          </Stack.Navigator>
        )}
        <PostTypeChoiceModal />
        <Toast />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
