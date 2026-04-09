import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import StoriesNotificationSetting from '../../features/community/StoriesNotificationSetting';

type CommunityStoriesNotificationSettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityStoriesNotificationSetting'
>;

function CommunityStoriesNotificationSetting(
  _: CommunityStoriesNotificationSettingProps
) {
  const route =
    useRoute<
      RouteProp<RootStackParamList, 'CommunityStoriesNotificationSetting'>
    >();

  return <StoriesNotificationSetting community={route?.params?.community} />;
}

export default CommunityStoriesNotificationSetting;
