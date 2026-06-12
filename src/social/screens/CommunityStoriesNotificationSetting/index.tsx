import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { StoriesNotificationSetting } from '../../features/community/StoriesNotificationSetting';

export function CommunityStoriesNotificationSettingScreen() {
  const route =
    useRoute<
      RouteProp<RootStackParamList, 'CommunityStoriesNotificationSetting'>
    >();
  const { community } = route.params;

  return <StoriesNotificationSetting community={community} />;
}
