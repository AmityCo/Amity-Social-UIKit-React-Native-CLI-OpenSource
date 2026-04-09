import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Membership from '../../features/community/Membership';

type CommunityMembershipProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityMembership'
>;

function CommunityMembership(_: CommunityMembershipProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityMembership'>>();

  return <Membership community={route?.params?.community} />;
}

export default CommunityMembership;
