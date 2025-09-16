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
import useAuth from '~/hooks/useAuth';
import CategoryList from '~/screens/CategorytList';
import CommunityList from '~/screens/CommunityList';
import CommunityMemberDetail from '~/screens/CommunityMemberDetail/CommunityMemberDetail';
import AmitySocialHomePage from '~/v4/PublicApi/Pages/AmitySocialHomePage/AmitySocialHomePage';
import PostDetail from '~/v4/screen/PostDetail';
import CreatePost from '~/v4/screen/CreatePost';
import UserProfile from '~/v4/screen/UserProfile';
import { EditProfile } from '~/screens/EditProfile/EditProfile';
import UserProfileSetting from '~/screens/UserProfileSetting/UserProfileSetting';
import CommunitySearch from '~/screens/CommunitySearch';
import AllMyCommunity from '~/screens/AllMyCommunity';
import CreateCommunity from '~/v4/screen/CreateCommunity';
import PendingPosts from '~/screens/PendingPosts';
import type { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { useTheme } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { closeIcon } from '~/svg/svg-xml-list';
import { useStyles } from '~/routes/style';
import BackButton from '~/components/BackButton';
import VideoPlayerFull from '~/screens/VideoPlayerFullScreen';
import PostTypeChoiceModal from '~/components/PostTypeChoiceModal/PostTypeChoiceModal';
import ReactionListScreen from '~/screens/ReactionListScreen/ReactionListScreen';
import CreateStoryScreen from '~/v4/screen/CreateStory/CreateStoryScreen';
import Toast from '~/components/Toast/Toast';
import AmitySocialGlobalSearchPage from '~/v4/PublicApi/Pages/AmitySocialGlobalSearchPage/AmitySocialGlobalSearchPage';
import UserPendingRequest from '~/v4/screen/UserPendingRequest/UserPendingRequest';
import FollowerList from '~/v4/screen/FollowerList/FollowerList';
import AmityMyCommunitiesSearchPage from '~/v4/PublicApi/Pages/AmityMyCommunitiesSearchPage/AmityMyCommunitiesSearchPage';
import CreateLivestream from '~/v4/screen/CreateLivestream';
import PostTargetSelection from '~/v4/screen/PostTargetSelection';
import StoryTargetSelection from '~/v4/PublicApi/Pages/AmityStoryTargetSelectionPage/AmityStoryTargetSelectionPage';
import LivestreamPostTargetSelection from '~/v4/screen/LivestreamPostTargetSelection';
import AmityAllCategoriesPage from '~/v4/PublicApi/Pages/AmityAllCategoriesPage/AmityAllCategoriesPage';
import AmityCommunitiesByCategoryPage from '~/v4/PublicApi/Pages/AmityCommunitiesByCategoryPage/AmityCommunitiesByCategoryPage';
import AmityCommunityProfilePage from '~/v4/PublicApi/Pages/AmityCommunityProfilePage/AmityCommunityProfilePage';
import EditPost from '~/v4/screen/EditPost/EditPost';
import AmityExploreComponent from '~/v4/PublicApi/Components/AmityExploreComponent/AmityExploreComponent';
import LivestreamPlayer from '~/v4/screen/LivestreamPlayer';
import LivestreamTerminated from '~/v4/screen/LivestreamTerminated';
import PollTargetSelection from '~/v4/screen/PollTargetSelection';
import PollPostComposer from '~/v4/screen/PollPostComposer';
import CommunityAddCategory from '~/v4/screen/CommunityAddCategory';
import CommunityAddMember from '~/v4/screen/CommunityAddMember';
import EditCommunity from '~/v4/screen/EditCommunity';
import CommunitySetting from '~/v4/screen/CommunitySetting';
import CommunityMembership from '~/v4/screen/CommunityMembership';
import CommunityPostPermission from '~/v4/screen/CommunityPostPermission';
import CommunityStorySetting from '~/v4/screen/CommunityStorySetting';
import CommunityNotificationSetting from '~/v4/screen/CommunityNotificationSetting';
import CommunityPostsNotificationSetting from '~/v4/screen/CommunityPostsNotificationSetting';
import CommunityCommentsNotificationSetting from '~/v4/screen/CommunityCommentsNotificationSetting';
import CommunityStoriesNotificationSetting from '~/v4/screen/CommunityStoriesNotificationSetting';
import CommunityLivestreamsNotificationSetting from '~/v4/screen/CommunityLivestreamsNotificationSetting';
import CommunityPendingRequest from '~/v4/screen/CommunityPendingRequest';

export default function AmitySocialUIKitV4Navigator() {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const { isConnected } = useAuth();
  const theme = useTheme() as MyMD3Theme;

  const styles = useStyles();
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
                backgroundColor: 'white',
              },
              headerStyle: {
                backgroundColor: theme.colors.background,
              },
              headerTitleStyle: {
                color: theme.colors.base,
              },
            }}
          >
            <Stack.Screen
              name="Home"
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
            />
            <Stack.Screen
              name="PostDetail"
              component={PostDetail}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CategoryList"
              component={CategoryList}
              options={({}) => ({
                title: 'Category',
              })}
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
              name="CommunityPendingRequest"
              component={CommunityPendingRequest}
            />
            <Stack.Screen
              name="CommunitySetting"
              component={CommunitySetting}
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
            <Stack.Screen name="CreateCommunity" component={CreateCommunity} />
            <Stack.Screen
              name="CommunityAddCategory"
              component={CommunityAddCategory}
            />
            <Stack.Screen
              name="CommunityAddMember"
              component={CommunityAddMember}
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
                    style={styles.btnWrap}
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
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfile}
              options={{
                headerLeft: () => <BackButton />,
                headerTitleAlign: 'center',
                title: 'Member',
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
            <Stack.Screen
              name="CommunityProfilePage"
              component={AmityCommunityProfilePage}
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
                name="LivestreamPostTargetSelection"
                component={LivestreamPostTargetSelection}
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
            </Stack.Group>
          </Stack.Navigator>
        )}
        <PostTypeChoiceModal />
        <Toast />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
