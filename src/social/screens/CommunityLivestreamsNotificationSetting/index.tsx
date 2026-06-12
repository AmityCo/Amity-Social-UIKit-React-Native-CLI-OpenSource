import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { LivestreamsNotificationSetting } from '../../features/community/LivestreamsNotificationSetting';

export function CommunityLivestreamsNotificationSettingScreen() {
  const route =
    useRoute<
      RouteProp<RootStackParamList, 'CommunityLivestreamsNotificationSetting'>
    >();
  const { community } = route.params;

  return <LivestreamsNotificationSetting community={community} />;
}
