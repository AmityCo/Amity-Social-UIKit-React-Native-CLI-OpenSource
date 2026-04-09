import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PendingRequest from '../../features/community/PendingRequest';

type CommunityPendingRequestProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityPendingRequest'
>;

function CommunityPendingRequest(_: CommunityPendingRequestProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityPendingRequest'>>();

  return <PendingRequest community={route?.params?.community} />;
}

export default CommunityPendingRequest;
