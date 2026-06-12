import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NotificationSetting } from '../../features/community/NotificationSetting';

export function CommunityNotificationSettingScreen() {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityNotificationSetting'>>();
  const { community } = route.params;

  return <NotificationSetting community={community} />;
}
