import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import StorySetting from '../../features/community/StorySetting';

type CommunityStorySettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityStorySetting'
>;

function CommunityStorySetting(_: CommunityStorySettingProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityStorySetting'>>();

  return <StorySetting community={route?.params?.community} />;
}

export default CommunityStorySetting;
