import { RouteProp, useRoute } from '@react-navigation/native';
import { EditUser } from '../../features/user/Edit';
import { RootStackParamList } from '../../../core/routes/RouteParamList';

export function EditUserScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'EditUser'>>();
  const { userId } = route.params;

  return <EditUser userId={userId} />;
}
