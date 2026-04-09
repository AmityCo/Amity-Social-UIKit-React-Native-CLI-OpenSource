import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LivestreamsNotificationSetting from '../../features/community/LivestreamsNotificationSetting';

type CommunityLivestreamsNotificationSettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityLivestreamsNotificationSetting'
>;

function CommunityLivestreamsNotificationSetting(
  _: CommunityLivestreamsNotificationSettingProps
) {
  const route =
    useRoute<
      RouteProp<RootStackParamList, 'CommunityLivestreamsNotificationSetting'>
    >();

  return (
    <LivestreamsNotificationSetting community={route?.params?.community} />
  );
}

export default CommunityLivestreamsNotificationSetting;
