import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunitySetupPage, {
  AmityCommunitySetupPageMode,
} from '../../features/community/Setup';
import { RootStackParamList } from '../../../core/routes/RouteParamList';

type CreateCommunityProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateCommunity'
>;

function CreateCommunity(_: CreateCommunityProps) {
  return <AmityCommunitySetupPage mode={AmityCommunitySetupPageMode.CREATE} />;
}

export default CreateCommunity;
