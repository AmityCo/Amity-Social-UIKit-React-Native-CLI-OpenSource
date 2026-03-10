import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Setting from '../../features/community/Setting';

type CommunitySettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunitySetting'
>;

function CommunitySetting(_: CommunitySettingProps) {
  const route = useRoute<RouteProp<RootStackParamList, 'CommunitySetting'>>();

  return <Setting community={route?.params?.community} />;
}

export default CommunitySetting;
