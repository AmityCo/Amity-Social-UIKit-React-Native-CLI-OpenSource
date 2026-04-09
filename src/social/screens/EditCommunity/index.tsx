import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunitySetupPage, {
  AmityCommunitySetupPageMode,
} from '../../features/community/Setup';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { RouteProp, useRoute } from '@react-navigation/native';

type EditCommunityProps = NativeStackScreenProps<
  RootStackParamList,
  'EditCommunity'
>;

function EditCommunity(_: EditCommunityProps) {
  const route = useRoute<RouteProp<RootStackParamList, 'EditCommunity'>>();
  return (
    <AmityCommunitySetupPage
      community={route?.params?.community}
      mode={AmityCommunitySetupPageMode.EDIT}
    />
  );
}

export default EditCommunity;
