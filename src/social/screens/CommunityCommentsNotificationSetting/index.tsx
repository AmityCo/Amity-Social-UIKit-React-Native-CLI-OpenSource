import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { CommentsNotificationSetting } from '../../features/community/CommentsNotificationSetting';

export function CommunityCommentsNotificationSettingScreen() {
  const route =
    useRoute<
      RouteProp<RootStackParamList, 'CommunityCommentsNotificationSetting'>
    >();
  const { community } = route.params;

  return <CommentsNotificationSetting community={community} />;
}
