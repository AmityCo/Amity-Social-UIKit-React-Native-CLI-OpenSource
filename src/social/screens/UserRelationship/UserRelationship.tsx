import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { Relationship } from '../../features/user/Relationship';

export function UserRelationshipScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'UserRelationship'>>();
  const { userId, selectedTab } = route.params;

  return <Relationship userId={userId} selectedTab={selectedTab} />;
}
