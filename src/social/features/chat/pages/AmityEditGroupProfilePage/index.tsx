// AmityEditGroupProfilePage — edit group name + avatar.
import { SafeAreaView } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { EditGroupProfile } from '../../features/group/edit-profile';

export default function AmityEditGroupProfilePage() {
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityEditGroupProfilePage'>>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <EditGroupProfile channelId={params.channelId} />
    </SafeAreaView>
  );
}
