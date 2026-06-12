import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { PostsNotificationSetting } from '../../features/community/PostsNotificationSetting';

export function CommunityPostsNotificationSettingScreen() {
  const route =
    useRoute<
      RouteProp<RootStackParamList, 'CommunityPostsNotificationSetting'>
    >();
  const { community } = route.params;

  return <PostsNotificationSetting community={community} />;
}
