import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import AddMember from '../../features/community/AddMember';

type CommunityAddMemberProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityAddMember'
>;

function CommunityAddMember(_: CommunityAddMemberProps) {
  return <AddMember />;
}

export default CommunityAddMember;
