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
import AmitySocialHomePage from '../../social/legacy/Pages/AmitySocialHomePage/AmitySocialHomePage';
import PostDetail from '../../social/pages/PostDetail';
import CreatePost from '../../social/pages/CreatePost';
import UserProfile from '../../social/pages/UserProfile';
import { EditProfile } from '../../social/pages/EditProfile/EditProfile';
import UserProfileSetting from '../../social/pages/UserProfileSetting/UserProfileSetting';
import AllMyCommunity from '../../social/pages/AllMyCommunity';
import CreateCommunity from '../../social/pages/CreateCommunity';
import type { MyMD3Theme } from '../providers/AmityUIKitProvider';
import { useTheme } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { closeIcon } from '../assets/icons/xml';
import BackButton from '../../social/components/legacy/BackButton';
import VideoPlayerFull from '../../social/pages/VideoPlayerFullScreen';
import PostTypeChoiceModal from '../../social/components/legacy/PostTypeChoiceModal/PostTypeChoiceModal';
import ReactionListScreen from '../../social/pages/ReactionListScreen/ReactionListScreen';
import CreateStoryScreen from '../../social/pages/CreateStory/CreateStoryScreen';
import Toast from '../../social/components/legacy/Toast/Toast';
import AmitySocialGlobalSearchPage from '../../social/legacy/Pages/AmitySocialGlobalSearchPage/AmitySocialGlobalSearchPage';
import UserPendingRequest from '../../social/pages/UserPendingRequest/UserPendingRequest';
import FollowerList from '../../social/pages/FollowerList/FollowerList';
import AmityMyCommunitiesSearchPage from '../../social/legacy/Pages/AmityMyCommunitiesSearchPage/AmityMyCommunitiesSearchPage';
import CreateLivestream from '../../social/pages/CreateLivestream';
import PostTargetSelection from '../../social/pages/PostTargetSelection';
import StoryTargetSelection from '../../social/legacy/Pages/AmityStoryTargetSelectionPage/AmityStoryTargetSelectionPage';
import LivestreamPostTargetSelection from '../../social/pages/LivestreamPostTargetSelection';
import AmityAllCategoriesPage from '../../social/legacy/Pages/AmityAllCategoriesPage/AmityAllCategoriesPage';
import AmityCommunitiesByCategoryPage from '../../social/legacy/Pages/AmityCommunitiesByCategoryPage/AmityCommunitiesByCategoryPage';
import AmityCommunityProfilePage from '../../social/legacy/Pages/AmityCommunityProfilePage/AmityCommunityProfilePage';
import EditPost from '../../social/pages/EditPost/EditPost';
import AmityExploreComponent from '../../social/legacy/Components/AmityExploreComponent/AmityExploreComponent';
import LivestreamPlayer from '../../social/pages/LivestreamPlayer';
import LivestreamTerminated from '../../social/pages/LivestreamTerminated';
import PollTargetSelection from '../../social/pages/PollTargetSelection';
import PollPostComposer from '../../social/pages/PollPostComposer';
import CommunityAddCategory from '../../social/pages/CommunityAddCategory';
import CommunityAddMember from '../../social/pages/CommunityAddMember';
import EditCommunity from '../../social/pages/EditCommunity';
import CommunitySetting from '../../social/pages/CommunitySetting';
import CommunityMembership from '../../social/pages/CommunityMembership';
import CommunityPostPermission from '../../social/pages/CommunityPostPermission';
import CommunityStorySetting from '../../social/pages/CommunityStorySetting';
import CommunityNotificationSetting from '../../social/pages/CommunityNotificationSetting';
import CommunityPostsNotificationSetting from '../../social/pages/CommunityPostsNotificationSetting';
import CommunityCommentsNotificationSetting from '../../social/pages/CommunityCommentsNotificationSetting';
import CommunityStoriesNotificationSetting from '../../social/pages/CommunityStoriesNotificationSetting';
import CommunityLivestreamsNotificationSetting from '../../social/pages/CommunityLivestreamsNotificationSetting';
import CommunityPendingRequest from '../../social/pages/CommunityPendingRequest';
import { GlobalBan } from '../../social/pages/GlobalBan';

const Stack = createNativeStackNavigator<
  RootStackParamList,
  'AmitySocialUIKit'
>();

export default function AmitySocialUIKitV4Navigator() {
  const theme = useTheme<MyMD3Theme>();
  const { isGlobalBan } = useAuth();

  if (isGlobalBan) return <GlobalBan />;

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
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
          <Stack.Screen
            name="AmityExploreComponent"
            component={AmityExploreComponent}
          />
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
          <Stack.Screen name="CreatePost" component={CreatePost} />
          <Stack.Screen name="EditPost" component={EditPost} />
          <Stack.Screen name="PostDetail" component={PostDetail} />

          {/* --- POLL --- */}
          <Stack.Screen name="PollPostComposer" component={PollPostComposer} />

          {/* --- User --- */}
          <Stack.Screen
            name="UserProfile"
            component={UserProfile}
            options={{
              headerShown: true,
              headerLeft: () => <BackButton />,
              headerTitleAlign: 'center',
              title: 'Member',
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={{
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="UserProfileSetting"
            component={UserProfileSetting}
            options={{
              headerShown: true,
            }}
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

          <Stack.Screen name="VideoPlayer" component={VideoPlayerFull} />

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
              name="PollTargetSelection"
              component={PollTargetSelection}
            />
            <Stack.Screen
              name="StoryTargetSelection"
              component={StoryTargetSelection}
            />

            {/* --- Livestream --- */}
            <Stack.Screen
              name="LivestreamPostTargetSelection"
              component={LivestreamPostTargetSelection}
            />
            <Stack.Screen
              name="CreateLivestream"
              component={CreateLivestream}
            />
            <Stack.Screen
              name="LivestreamPlayer"
              component={LivestreamPlayer}
            />
            <Stack.Screen
              name="LivestreamTerminated"
              component={LivestreamTerminated}
            />
          </Stack.Group>
        </Stack.Navigator>
        <PostTypeChoiceModal />
        <Toast />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
